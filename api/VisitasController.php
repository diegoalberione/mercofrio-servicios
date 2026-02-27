<?php
/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link      https://cakephp.org CakePHP(tm) Project
 * @since     0.2.9
 * @license   https://opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Controller;

use Cake\ORM\TableRegistry;
use Cake\Core\Configure;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;
use Cake\Datasource\ConnectionManager;

use App\Model\Entity\Autenticacion;

use Cake\Mailer\Email;

use JWT;
use DateTime;
use DateTimeZone;

use Spipu\Html2Pdf\Html2Pdf;

require_once(ROOT . DS . 'vendor' . DS . "jwt" . DS . "JWT.php");

/**
 * Static content controller
 *
 * This controller will render views from Template/Pages/
 *
 * @link https://book.cakephp.org/3.0/en/controllers/pages-controller.html
 */
class VisitasController extends AppController
{

	public function listar()
	{
		ob_start();
		header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
		header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
		header('Access-Control-Allow-Origin: *');

		$this->autoRender = false;

		$request_body = file_get_contents('php://input');
		$data = json_decode($request_body, true);
		if ($data == null) {
			$data = $_REQUEST;
		}

		$token = null;
		$mensaje = null;
		$res = null;

		if (!isset($_REQUEST['key'])) {
			$autenticacion = new Autenticacion();
			$token = $autenticacion->verificarToken($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
			$payload = JWT::decode($token, Configure::read('JWT.key'), array('HS256'));
		} else if ($_REQUEST['key'] == '33712176399') {
			$token = 1;
		}

		if ($token != null) {

			$conditions = [];
			$conditions[] = 'Visitas.eliminado IS NULL';
			if (isset($data['filter'])) {
				foreach (explode('##', $data['filter']) as $filtro) {
					$f = [];
					$f = explode('LIKE', $filtro);
					if (isset($f[1])) {
						$conditions["UPPER(" . $f[0] . ") LIKE "] = '%' . strtoupper($f[1]) . '%';
					} else {
						$conditions[] = $f[0];
					}
				}
			}

			if (isset($data['cliente_usuario_id'])) {
				$conditions['Visitas.cliente_usuario_id'] = $data['cliente_usuario_id'];
			}

			if (isset($data['id'])) {
				$conditions['Visitas.id'] = $data['id'];
			}

			if (isset($data['responsable_usuario_id'])) {
				$conditions['Visitas.responsable_usuario_id'] = $data['responsable_usuario_id'];
			}

			if (isset($data['zona_id'])) {
				$conditions['Visitas.zona_id'] = $data['zona_id'];
			}

			$order = ['Visitas.id DESC'];
			if (isset($data['sort'])) {
				$order = $data['sort'];
			}

			$limit = 100;
			$page = 1;
			if (isset($data['page'])) {
				$page = $data['page'];
			}
			if (isset($data['limit'])) {
				$limit = $data['limit'];
			}

			$conf = [
				'conditions' => $conditions,
				'order' => $order,
				'page' => $page,
				'limit' => $limit
			];

			$dataTable = TableRegistry::getTableLocator()->get('Visitas');
			$res = $dataTable->find('all', $conf)->toArray();

			$dtUsuarios = TableRegistry::getTableLocator()->get('Usuarios');
			$dtServicio = TableRegistry::getTableLocator()->get('Servicios');
			$dtMultimedias = TableRegistry::getTableLocator()->get('Multimedias');
			$dtTrabajos = TableRegistry::getTableLocator()->get('Trabajos');
			$dtRepuestos = TableRegistry::getTableLocator()->get('ServiciosRepuestos');
			$dtMarcas = TableRegistry::getTableLocator()->get('Marcas');
			$dtServiciostipos = TableRegistry::getTableLocator()->get('Serviciostipos');
			if (isset($data['banCompleto'])) {
				$auxVisitas = [];
				foreach ($res as $v) {

					$v['ClienteUsuario'] = $dtUsuarios->find('all', [
						'conditions' => ['Usuarios.id' => $v['cliente_usuario_id']]
					])->first();

					$servicios = $dtServicio->find('all', [
						'conditions' => ['Servicios.visita_id' => $v['id']],
						//'contain' => ['Serviciostipo', 'Marca']
					])->toArray();

					$auxServicios = [];
					foreach ($servicios as $s) {
						/**/
						$s['marca'] = $dtMarcas->find('all', [
							'conditions' => ['id' => $s['marca_id']]
						])->first();
						$s['serviciostipo'] = $dtServiciostipos->find('all', [
							'conditions' => ['id' => $s['serviciostipo_id']]
						])->first();
						/**/
						$s['trabajos'] = $dtTrabajos->find('all', [
							'conditions' => ['Trabajos.servicio_id' => $s['id']]
						])->toArray();
						$s['repuestos'] = $dtRepuestos->find('all', [
							'conditions' => ['ServiciosRepuestos.servicio_id' => $s['id']]
						])->toArray();
						$s['multimedias'] = $dtMultimedias->find('all', [
							'conditions' => ['Multimedias.servicio_id' => $s['id']]
						])->toArray();

						$auxServicios[] = $s;
					}

					$v['servicios'] = $auxServicios;

					// Cargar visitas_usuarios (técnicos que asistieron)
					$conn = ConnectionManager::get('default');
					$visitasUsuarios = $conn->execute("SELECT usuario_id FROM visitas_usuarios WHERE visita_id = ?", [$v['id']])->fetchAll('assoc');
					$v['visitas_usuarios'] = !empty($visitasUsuarios) ? array_column($visitasUsuarios, 'usuario_id') : [];

					// Cargar visitas_vehiculos (vehículos utilizados)
					$visitasVehiculos = $conn->execute("SELECT vehiculo_id FROM visitas_vehiculos WHERE visita_id = ?", [$v['id']])->fetchAll('assoc');
					$v['visitas_vehiculos'] = !empty($visitasVehiculos) ? array_column($visitasVehiculos, 'vehiculo_id') : [];

					// si esta firmad busca su multimedia
					if ($v['firma_multimedia_id'] != 'NULL') {
						$v['firma'] = $dtMultimedias->find('all', [
							'conditions' => ['Multimedias.id' => $v['firma_multimedia_id']]
						])->first();
					}

					$auxVisitas[] = $v;
				}

				$res = $auxVisitas;
			}

			$mensaje = array();
			$mensaje['tipo'] = 'success';
			$mensaje['texto'] = 'Correcto!';
		} else {
			$mensaje = array();
			$mensaje['tipo'] = 'error';
			$mensaje['texto'] = 'Usuario/contraseña incorrecto!';
		}

		$json = array();
		$json['mensaje'] = $mensaje;
		$json['token'] = $token;
		$json['visitas'] = $res;
		return $this->response->withType("application/json")->withStringBody(json_encode($json));
	}

	public function guardar()
	{
		ob_start();
		header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
		header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
		header('Access-Control-Allow-Origin: *');

		$this->autoRender = false;

		$request_body = file_get_contents('php://input');
		$data = json_decode($request_body, true);
		if (sizeOf($_REQUEST) > 0) {
			$data = $_REQUEST;
		}
		$c = null;

		$mensaje = null;

		$autenticacion = new Autenticacion();
		$token = $autenticacion->verificarToken($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);

		if ($token != null) {

			$banOk = true;

			if ($banOk) {
				$dataTable = TableRegistry::getTableLocator()->get('Visitas');
				$c = $dataTable->newEntity($data, ['validate' => false]);

				$payload = JWT::decode($token, Configure::read('JWT.key'), array('HS256'));
				$c['modificado_usuario_id'] = $payload->id;
				$c['modificado'] = date('Y-m-d H:i');

				if ($dataTable->save($c)) {

					$data['id'] = $c->id;

					// se recorren los servicios de la visita
					if (isset($data['servicios'])) {
						$conn = ConnectionManager::get('default');
						$conn->execute("
							DELETE FROM servicios
							WHERE visita_id = {$data['id']}
						");
						
						$auxServicios = [];
						foreach ($data['servicios'] as $servicio) {
							$serviciosTable = TableRegistry::getTableLocator()->get('Servicios');
							$servicio['visita_id'] = $data['id'];
							$s = $serviciosTable->newEntity($servicio, ['validate' => false]);

							if ($serviciosTable->save($s)) {
								$servicio['id'] = $s->id;

								// recorre los trabajos								
								if (isset($servicio['trabajos'])) {
									$conn = ConnectionManager::get('default');
									$conn->execute("
										DELETE FROM trabajos
										WHERE servicio_id = {$servicio['id']}
									");

									$auxTrabajos = [];
									foreach ($servicio['trabajos'] as $trabajo) {
										$trabajosTable = TableRegistry::getTableLocator()->get('Trabajos');
										$trabajo['servicio_id'] = $servicio['id'];
										$t = $trabajosTable->newEntity($trabajo, ['validate' => false]);

										if ($trabajosTable->save($t)) {
											$trabajo['id'] = $t->id;
										}
										$auxTrabajos[] = $trabajo;
									}
									$servicio['trabajos'] = $auxTrabajos;
								}

								// recorre los repuestos
								if (isset($servicio['repuestos'])) {
									$conn = ConnectionManager::get('default');
									$conn->execute("
										DELETE FROM servicios_repuestos
										WHERE servicio_id = {$servicio['id']}
									");

									$auxRepuestos = [];
									foreach ($servicio['repuestos'] as $repuesto) {
										$servicioRepuestoTable = TableRegistry::getTableLocator()->get('ServiciosRepuestos');
										$repuesto['servicio_id'] = $servicio['id'];
										$t = $servicioRepuestoTable->newEntity($repuesto, ['validate' => false]);

										if ($servicioRepuestoTable->save($t)) {
											$repuesto['id'] = $t->id;
										}
										$auxRepuestos[] = $trabajo;
									}
									$servicio['repuestos'] = $auxRepuestos;
								}

								// guarda las fotos pre y post en formato base64
								if (isset($servicio['fotos_pre']) || isset($servicio['fotos_post'])) {
									$conn = ConnectionManager::get('default');
									$conn->execute("
										DELETE FROM multimedias
										WHERE servicio_id = {$servicio['id']}
									");

									$auxMultimedias = [];
									
									// Guardar fotos pre (tipo = 0)
									if (isset($servicio['fotos_pre'])) {
										foreach ($servicio['fotos_pre'] as $foto) {
											if (isset($foto['base64']) && !empty($foto['base64'])) {
												$m = array();
												$m['tipo'] = 0; // foto pre
												$m['servicio_id'] = $servicio['id'];
												$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
												$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
												$multimediasTable->save($mEntity);

												// guarda el archivo
												$path = APP . '../../files/multimedias_v2/';
												$ruta = $path . $mEntity->id . '.jpeg';

												// open the output file for writing
												$ifp = fopen($ruta, 'wb');

												// split the string on commas
												$dataB64 = explode(',', $foto['base64']);

												// we could add validation here with ensuring count( $data ) > 1
												if (count($dataB64) > 1) {
													// Formato: data:image/jpeg;base64,<base64_string>
													fwrite($ifp, base64_decode($dataB64[1]));
												} else {
													// Formato: <base64_string> (sin prefijo)
													fwrite($ifp, base64_decode($foto['base64']));
												}

												// clean up the file resource
												fclose($ifp);

												// guarda en campo codigo
												$m['id'] = $mEntity->id;
												$m['codigo'] = $mEntity->id . '.jpeg';
												$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
												$multimediasTable->save($mEntity);

												$foto['id'] = $mEntity->id;
												$auxMultimedias[] = $foto;
											}
										}
									}

									// Guardar fotos post (tipo = 1)
									if (isset($servicio['fotos_post'])) {
										foreach ($servicio['fotos_post'] as $foto) {
											if (isset($foto['base64']) && !empty($foto['base64'])) {
												$m = array();
												$m['tipo'] = 1; // foto post
												$m['servicio_id'] = $servicio['id'];
												$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
												$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
												$multimediasTable->save($mEntity);

												// guarda el archivo
												$path = APP . '../../files/multimedias_v2/';
												$ruta = $path . $mEntity->id . '.jpeg';

												// open the output file for writing
												$ifp = fopen($ruta, 'wb');

												// split the string on commas
												$dataB64 = explode(',', $foto['base64']);

												// we could add validation here with ensuring count( $data ) > 1
												if (count($dataB64) > 1) {
													// Formato: data:image/jpeg;base64,<base64_string>
													fwrite($ifp, base64_decode($dataB64[1]));
												} else {
													// Formato: <base64_string> (sin prefijo)
													fwrite($ifp, base64_decode($foto['base64']));
												}

												// clean up the file resource
												fclose($ifp);

												// guarda en campo codigo
												$m['id'] = $mEntity->id;
												$m['codigo'] = $mEntity->id . '.jpeg';
												$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
												$multimediasTable->save($mEntity);

												$foto['id'] = $mEntity->id;
												$auxMultimedias[] = $foto;
											}
										}
									}

									$servicio['multimedias'] = $auxMultimedias;
								}
							}
							$auxServicios[] = $servicio;
						}
						$data['servicios'] = $auxServicios;
					}

					// Guardar visitas_usuarios (técnicos que asistieron)
					if (isset($data['visitas_usuarios']) && is_array($data['visitas_usuarios'])) {
						$conn = ConnectionManager::get('default');
						$conn->execute("DELETE FROM visitas_usuarios WHERE visita_id = ?", [$data['id']]);
						
						foreach ($data['visitas_usuarios'] as $usuario_id) {
							if (!empty($usuario_id)) {
								$conn->execute("INSERT INTO visitas_usuarios (visita_id, usuario_id) VALUES (?, ?)", [$data['id'], $usuario_id]);
							}
						}
					}

					// Guardar visitas_vehiculos (vehículos utilizados)
					if (isset($data['visitas_vehiculos']) && is_array($data['visitas_vehiculos'])) {
						$conn = ConnectionManager::get('default');
						$conn->execute("DELETE FROM visitas_vehiculos WHERE visita_id = ?", [$data['id']]);
						
						foreach ($data['visitas_vehiculos'] as $vehiculo_id) {
							if (!empty($vehiculo_id)) {
								$conn->execute("INSERT INTO visitas_vehiculos (visita_id, vehiculo_id) VALUES (?, ?)", [$data['id'], $vehiculo_id]);
							}
						}
					}

					// guarda la firma que viene en base64
					if (isset($data['firma_multimedia']) && ($data['firma_multimedia'] != '')) {
						$m = array();
						$m['tipo'] = 10; // firma del cliente
						$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
						$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
						$multimediasTable->save($mEntity);

						$data['firma_multimedia_id'] = $mEntity->id;
						$cAux = $dataTable->newEntity($data, ['validate' => false]);
						$dataTable->save($cAux);

						// guarda el archivo
						$path = APP . '../../files/multimedias_v2/';
						$ruta = $path . $mEntity->id . '.png';

						// open the output file for writing
						$ifp = fopen($ruta, 'wb');

						// split the string on commas
						// $data[ 0 ] == "data:image/png;base64"
						// $data[ 1 ] == <actual base64 string>
						$dataB64 = explode(',', $data['firma_multimedia']);

						// we could add validation here with ensuring count( $data ) > 1
						fwrite($ifp, base64_decode($dataB64[1]));

						// clean up the file resource
						fclose($ifp);

						// guarda en campo codigo
						$m['id'] = $mEntity->id;
						$m['codigo'] = $mEntity->id . '.png';
						$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
						$multimediasTable->save($mEntity);
					}

					$mensaje = array();
					$mensaje['tipo'] = 'success';
					$mensaje['texto'] = 'Guardado!';
				} else {
					$mensaje = array();
					$mensaje['tipo'] = 'error';
					$mensaje['texto'] = 'No se pudo guardar!';
				}
			}
		} else {
			$mensaje = array();
			$mensaje['tipo'] = 'error';
			$mensaje['texto'] = 'No se pudo guardar! error de verificación.';
		}

		$json = array();
		$json['mensaje'] = $mensaje;
		$json['token'] = $token;
		$json['visita'] = $data;
		return $this->response->withType("application/json")->withStringBody(json_encode($json));
	}

	/**
	 * Nuevo endpoint mejorado para guardar visitas
	 * Incluye validaciones, manejo de errores robusto, transacciones y corrección de bugs
	 */
	public function guardarV2()
	{
		ob_start();
		header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
		header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
		header('Access-Control-Allow-Origin: *');

		$this->autoRender = false;

		$mensaje = null;
		$res = null;
		$data = null;

		// Validar tamaño del request (máximo 50MB)
		$requestSize = strlen(file_get_contents('php://input'));
		$maxSize = 50 * 1024 * 1024; // 50MB
		
		if ($requestSize > $maxSize) {
			$mensaje = array();
			$mensaje['tipo'] = 'error';
			$mensaje['texto'] = 'El tamaño del request es demasiado grande (' . round($requestSize / 1024 / 1024, 2) . 'MB). Máximo permitido: ' . ($maxSize / 1024 / 1024) . 'MB';
			
			$json = array();
			$json['mensaje'] = $mensaje;
			$json['token'] = null;
			$json['visita'] = null;
			return $this->response->withType("application/json")->withStringBody(json_encode($json));
		}

		$request_body = file_get_contents('php://input');
		$data = json_decode($request_body, true);
		
		if ($data == null) {
			if (sizeOf($_REQUEST) > 0) {
				$data = $_REQUEST;
			} else {
				$mensaje = array();
				$mensaje['tipo'] = 'error';
				$mensaje['texto'] = 'No se recibieron datos válidos';
				
				$json = array();
				$json['mensaje'] = $mensaje;
				$json['token'] = null;
				$json['visita'] = null;
				return $this->response->withType("application/json")->withStringBody(json_encode($json));
			}
		}

		$autenticacion = new Autenticacion();
		$token = $autenticacion->verificarToken($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);

		if ($token != null) {
			$conn = ConnectionManager::get('default');
			
			// Iniciar transacción
			$conn->begin();
			
			try {
				$dataTable = TableRegistry::getTableLocator()->get('Visitas');
				$c = $dataTable->newEntity($data, ['validate' => false]);

				$payload = JWT::decode($token, Configure::read('JWT.key'), array('HS256'));
				$c['modificado_usuario_id'] = $payload->id;
				$c['modificado'] = date('Y-m-d H:i');

				if ($dataTable->save($c)) {
					$data['id'] = $c->id;

					// Se recorren los servicios de la visita
					if (isset($data['servicios']) && is_array($data['servicios'])) {
						// Eliminar servicios existentes
						$conn->execute("DELETE FROM servicios WHERE visita_id = ?", [$data['id']]);
						
						$auxServicios = [];
						foreach ($data['servicios'] as $servicio) {
							if (!is_array($servicio)) {
								continue; // Saltar si no es un array válido
							}

							$serviciosTable = TableRegistry::getTableLocator()->get('Servicios');
							$servicio['visita_id'] = $data['id'];
							$s = $serviciosTable->newEntity($servicio, ['validate' => false]);

							if ($serviciosTable->save($s)) {
								$servicio['id'] = $s->id;

								// Recorrer los trabajos
								if (isset($servicio['trabajos']) && is_array($servicio['trabajos'])) {
									$conn->execute("DELETE FROM trabajos WHERE servicio_id = ?", [$servicio['id']]);

									$auxTrabajos = [];
									foreach ($servicio['trabajos'] as $trabajo) {
										if (!is_array($trabajo)) {
											continue;
										}

										try {
											$trabajosTable = TableRegistry::getTableLocator()->get('Trabajos');
											$trabajo['servicio_id'] = $servicio['id'];
											$t = $trabajosTable->newEntity($trabajo, ['validate' => false]);

											if ($trabajosTable->save($t)) {
												$trabajo['id'] = $t->id;
											}
											$auxTrabajos[] = $trabajo;
										} catch (\Exception $e) {
											// Registrar error pero continuar
											error_log("Error guardando trabajo: " . $e->getMessage());
										}
									}
									$servicio['trabajos'] = $auxTrabajos;
								}

								// Recorrer los repuestos - CORREGIDO EL BUG
								if (isset($servicio['repuestos']) && is_array($servicio['repuestos'])) {
									$conn->execute("DELETE FROM servicios_repuestos WHERE servicio_id = ?", [$servicio['id']]);

									$auxRepuestos = [];
									foreach ($servicio['repuestos'] as $repuesto) {
										if (!is_array($repuesto)) {
											continue;
										}

										try {
											$servicioRepuestoTable = TableRegistry::getTableLocator()->get('ServiciosRepuestos');
											$repuesto['servicio_id'] = $servicio['id'];
											$t = $servicioRepuestoTable->newEntity($repuesto, ['validate' => false]);

											if ($servicioRepuestoTable->save($t)) {
												$repuesto['id'] = $t->id;
											}
											// BUG CORREGIDO: era $trabajo, ahora es $repuesto
											$auxRepuestos[] = $repuesto;
										} catch (\Exception $e) {
											// Registrar error pero continuar
											error_log("Error guardando repuesto: " . $e->getMessage());
										}
									}
									$servicio['repuestos'] = $auxRepuestos;
								}

								// Guardar las fotos pre y post en formato base64
								if (isset($servicio['fotos_pre']) || isset($servicio['fotos_post'])) {
									$conn->execute("DELETE FROM multimedias WHERE servicio_id = ?", [$servicio['id']]);

									$auxMultimedias = [];
									$maxImagenes = 20; // Límite de imágenes por servicio
									$imagenesProcesadas = 0;
									
									// Guardar fotos pre (tipo = 0)
									if (isset($servicio['fotos_pre']) && is_array($servicio['fotos_pre'])) {
										foreach ($servicio['fotos_pre'] as $foto) {
											if ($imagenesProcesadas >= $maxImagenes) {
												error_log("Límite de imágenes alcanzado para servicio " . $servicio['id']);
												break;
											}

											if (isset($foto['base64']) && !empty($foto['base64'])) {
												try {
													// Validar tamaño de imagen base64 (máximo 5MB por imagen)
													$tamañoImagen = strlen($foto['base64']);
													if ($tamañoImagen > 5 * 1024 * 1024) {
														error_log("Imagen demasiado grande: " . round($tamañoImagen / 1024 / 1024, 2) . "MB");
														continue;
													}

													$m = array();
													$m['tipo'] = 0; // foto pre
													$m['servicio_id'] = $servicio['id'];
													$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
													$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
													
													if (!$multimediasTable->save($mEntity)) {
														throw new \Exception("No se pudo guardar la entidad multimedia");
													}

													// Guardar el archivo
													$path = APP . '../../files/multimedias_v2/';
													
													// Verificar que el directorio existe
													if (!is_dir($path)) {
														if (!mkdir($path, 0755, true)) {
															throw new \Exception("No se pudo crear el directorio de imágenes");
														}
													}

													// Verificar permisos de escritura
													if (!is_writable($path)) {
														throw new \Exception("El directorio de imágenes no tiene permisos de escritura");
													}

													$ruta = $path . $mEntity->id . '.jpeg';

													$ifp = fopen($ruta, 'wb');
													if (!$ifp) {
														throw new \Exception("No se pudo abrir el archivo para escritura");
													}

													// Split the string on commas
													$dataB64 = explode(',', $foto['base64']);

													if (count($dataB64) > 1) {
														// Formato: data:image/jpeg;base64,<base64_string>
														$decoded = base64_decode($dataB64[1], true);
													} else {
														// Formato: <base64_string> (sin prefijo)
														$decoded = base64_decode($foto['base64'], true);
													}

													if ($decoded === false) {
														fclose($ifp);
														throw new \Exception("Error decodificando base64");
													}

													fwrite($ifp, $decoded);
													fclose($ifp);

													// Guardar en campo codigo
													$m['id'] = $mEntity->id;
													$m['codigo'] = $mEntity->id . '.jpeg';
													$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
													$multimediasTable->save($mEntity);

													$foto['id'] = $mEntity->id;
													$auxMultimedias[] = $foto;
													$imagenesProcesadas++;
												} catch (\Exception $e) {
													error_log("Error guardando foto pre: " . $e->getMessage());
													// Continuar con la siguiente imagen
												}
											}
										}
									}

									// Guardar fotos post (tipo = 1)
									if (isset($servicio['fotos_post']) && is_array($servicio['fotos_post'])) {
										foreach ($servicio['fotos_post'] as $foto) {
											if ($imagenesProcesadas >= $maxImagenes) {
												error_log("Límite de imágenes alcanzado para servicio " . $servicio['id']);
												break;
											}

											if (isset($foto['base64']) && !empty($foto['base64'])) {
												try {
													// Validar tamaño de imagen base64
													$tamañoImagen = strlen($foto['base64']);
													if ($tamañoImagen > 5 * 1024 * 1024) {
														error_log("Imagen demasiado grande: " . round($tamañoImagen / 1024 / 1024, 2) . "MB");
														continue;
													}

													$m = array();
													$m['tipo'] = 1; // foto post
													$m['servicio_id'] = $servicio['id'];
													$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
													$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
													
													if (!$multimediasTable->save($mEntity)) {
														throw new \Exception("No se pudo guardar la entidad multimedia");
													}

													// Guardar el archivo
													$path = APP . '../../files/multimedias_v2/';
													
													if (!is_dir($path)) {
														if (!mkdir($path, 0755, true)) {
															throw new \Exception("No se pudo crear el directorio de imágenes");
														}
													}

													if (!is_writable($path)) {
														throw new \Exception("El directorio de imágenes no tiene permisos de escritura");
													}

													$ruta = $path . $mEntity->id . '.jpeg';

													$ifp = fopen($ruta, 'wb');
													if (!$ifp) {
														throw new \Exception("No se pudo abrir el archivo para escritura");
													}

													$dataB64 = explode(',', $foto['base64']);

													if (count($dataB64) > 1) {
														$decoded = base64_decode($dataB64[1], true);
													} else {
														$decoded = base64_decode($foto['base64'], true);
													}

													if ($decoded === false) {
														fclose($ifp);
														throw new \Exception("Error decodificando base64");
													}

													fwrite($ifp, $decoded);
													fclose($ifp);

													// Guardar en campo codigo
													$m['id'] = $mEntity->id;
													$m['codigo'] = $mEntity->id . '.jpeg';
													$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
													$multimediasTable->save($mEntity);

													$foto['id'] = $mEntity->id;
													$auxMultimedias[] = $foto;
													$imagenesProcesadas++;
												} catch (\Exception $e) {
													error_log("Error guardando foto post: " . $e->getMessage());
													// Continuar con la siguiente imagen
												}
											}
										}
									}

									$servicio['multimedias'] = $auxMultimedias;
								}
							}
							$auxServicios[] = $servicio;
						}
						$data['servicios'] = $auxServicios;
					}

					// Guardar visitas_usuarios (técnicos que asistieron)
					if (isset($data['visitas_usuarios']) && is_array($data['visitas_usuarios'])) {
						try {
							$conn->execute("DELETE FROM visitas_usuarios WHERE visita_id = ?", [$data['id']]);
							
							foreach ($data['visitas_usuarios'] as $usuario_id) {
								if (!empty($usuario_id)) {
									$conn->execute("INSERT INTO visitas_usuarios (visita_id, usuario_id) VALUES (?, ?)", [$data['id'], $usuario_id]);
								}
							}
						} catch (\Exception $e) {
							error_log("Error guardando visitas_usuarios: " . $e->getMessage());
						}
					}

					// Guardar visitas_vehiculos (vehículos utilizados)
					if (isset($data['visitas_vehiculos']) && is_array($data['visitas_vehiculos'])) {
						try {
							$conn->execute("DELETE FROM visitas_vehiculos WHERE visita_id = ?", [$data['id']]);
							
							foreach ($data['visitas_vehiculos'] as $vehiculo_id) {
								if (!empty($vehiculo_id)) {
									$conn->execute("INSERT INTO visitas_vehiculos (visita_id, vehiculo_id) VALUES (?, ?)", [$data['id'], $vehiculo_id]);
								}
							}
						} catch (\Exception $e) {
							error_log("Error guardando visitas_vehiculos: " . $e->getMessage());
						}
					}

					// Guardar la firma que viene en base64
					if (isset($data['firma_multimedia']) && ($data['firma_multimedia'] != '')) {
						try {
							$m = array();
							$m['tipo'] = 10; // firma del cliente
							$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
							$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
							
							if ($multimediasTable->save($mEntity)) {
								$data['firma_multimedia_id'] = $mEntity->id;
								$cAux = $dataTable->newEntity($data, ['validate' => false]);
								$dataTable->save($cAux);

								// Guardar el archivo
								$path = APP . '../../files/multimedias_v2/';
								
								if (!is_dir($path)) {
									mkdir($path, 0755, true);
								}

								$ruta = $path . $mEntity->id . '.png';

								$ifp = fopen($ruta, 'wb');
								if ($ifp) {
									$dataB64 = explode(',', $data['firma_multimedia']);
									if (count($dataB64) > 1) {
										fwrite($ifp, base64_decode($dataB64[1], true));
									} else {
										fwrite($ifp, base64_decode($data['firma_multimedia'], true));
									}
									fclose($ifp);

									// Guardar en campo codigo
									$m['id'] = $mEntity->id;
									$m['codigo'] = $mEntity->id . '.png';
									$mEntity = $multimediasTable->newEntity($m, ['validate' => false]);
									$multimediasTable->save($mEntity);
								}
							}
						} catch (\Exception $e) {
							error_log("Error guardando firma: " . $e->getMessage());
							// No fallar todo por un error en la firma
						}
					}

					// Commit transacción
					$conn->commit();

					$mensaje = array();
					$mensaje['tipo'] = 'success';
					$mensaje['texto'] = 'Guardado correctamente!';
				} else {
					// Rollback si falla el guardado de la visita
					$conn->rollback();
					$mensaje = array();
					$mensaje['tipo'] = 'error';
					$mensaje['texto'] = 'No se pudo guardar la visita';
				}
			} catch (\Exception $e) {
				// Rollback en caso de cualquier error
				$conn->rollback();
				error_log("Error en guardarV2: " . $e->getMessage());
				
				$mensaje = array();
				$mensaje['tipo'] = 'error';
				$mensaje['texto'] = 'Error al guardar: ' . $e->getMessage();
			}
		} else {
			$mensaje = array();
			$mensaje['tipo'] = 'error';
			$mensaje['texto'] = 'No se pudo guardar! Error de verificación.';
		}

		$json = array();
		$json['mensaje'] = $mensaje;
		$json['token'] = $token;
		$json['visita'] = $data;
		return $this->response->withType("application/json")->withStringBody(json_encode($json));
	}

	public function eliminar($id = 0)
	{
		ob_start();
		header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
		header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
		header('Access-Control-Allow-Origin: *');

		$this->autoRender = false;

		$mensaje = array();

		if ($id == 0) {
			$id = $_REQUEST['id'];
		}

		$autenticacion = new Autenticacion();
		$token = $autenticacion->verificarToken($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);

		if ($token != null) {
			// Eliminar archivos físicos de multimedias
			$conn = ConnectionManager::get('default');
			$multimediasTable = TableRegistry::getTableLocator()->get('Multimedias');
			$serviciosTable = TableRegistry::getTableLocator()->get('Servicios');
			$path = APP . '../../files/multimedias_v2/';

			// Obtener los servicios asociados a la visita
			$servicios = $serviciosTable->find('all', [
				'conditions' => ['visita_id' => $id]
			])->toArray();
			$servicioIds = array_map(function($s) { return $s['id']; }, $servicios);

			if (!empty($servicioIds)) {
				// Buscar todos los multimedias asociados a los servicios
				$multimedias = $multimediasTable->find('all', [
					'conditions' => ['servicio_id IN' => $servicioIds]
				])->toArray();
				foreach ($multimedias as $m) {
					if (!empty($m['codigo'])) {
						$archivo = $path . $m['codigo'];
						if (file_exists($archivo)) {
							@unlink($archivo);
						}
					}
				}
			}

			// Eliminar trabajos relacionados a los servicios de la visita
			$conn->execute("DELETE FROM trabajos WHERE servicio_id IN (SELECT id FROM servicios WHERE visita_id = ?)", [$id]);
			// Eliminar repuestos relacionados a los servicios de la visita
			$conn->execute("DELETE FROM servicios_repuestos WHERE servicio_id IN (SELECT id FROM servicios WHERE visita_id = ?)", [$id]);
			// Eliminar multimedias relacionados a los servicios de la visita
			$conn->execute("DELETE FROM multimedias WHERE servicio_id IN (SELECT id FROM servicios WHERE visita_id = ?)", [$id]);
			// Eliminar servicios relacionados a la visita
			$conn->execute("DELETE FROM servicios WHERE visita_id = ?", [$id]);
			// Eliminar relaciones visitas_usuarios
			$conn->execute("DELETE FROM visitas_usuarios WHERE visita_id = ?", [$id]);
			// Eliminar relaciones visitas_vehiculos
			$conn->execute("DELETE FROM visitas_vehiculos WHERE visita_id = ?", [$id]);

			// Marcar la visita como eliminada
			$data = [];
			$data['id'] = $id;
			$data['eliminado'] = date('Y-m-d H:i:s');

			$payload = JWT::decode($token, Configure::read('JWT.key'), array('HS256'));
			$data['eliminado_usuario_id'] = $payload->id;
			$data['modificado_usuario_id'] = $payload->id;

			$entityTable = TableRegistry::getTableLocator()->get('Visitas');
			$c = $entityTable->newEntity($data, ['validate' => false]);

			if ($entityTable->save($c)) {
				$mensaje = array();
				$mensaje['tipo'] = 'success';
				$mensaje['texto'] = 'Eliminado!';
			} else {
				$mensaje = array();
				$mensaje['tipo'] = 'error';
				$mensaje['texto'] = 'No se pudo guardar!';
			}
		} else {
			$mensaje = array();
			$mensaje['tipo'] = 'error';
			$mensaje['texto'] = 'No se pudo guardar! error de verificación.';
		}

		$json = array();
		$json['mensaje'] = $mensaje;
		$json['token'] = $token;
		return $this->response->withType("application/json")->withStringBody(json_encode($json));
	}

	public function notificar($id = 0)
	{
		ob_start();

		$this->autoRender = false;

		$mensaje = array();
		$mensaje['tipo'] = 'error';
		$mensaje['texto'] = 'No se pudo notificar!';


		if ($id == 0) {
			$id = $_REQUEST['id'];
		}

		if ($id != 0) {
			$dataTable = TableRegistry::getTableLocator()->get('Visitas');
			$visita = $dataTable->find('all', [
				'conditions' => ['Visitas.id' => $id]
			])->first()->toArray();
			$visita = json_decode(json_encode($visita), true);

			$zonaTable = TableRegistry::getTableLocator()->get('Zonas');
			$zona = $zonaTable->find('all', [
				'conditions' => ['Zonas.id' => $visita['zona_id']]
			])->first()->toArray();

			$usuariosTable = TableRegistry::getTableLocator()->get('Usuarios');
			$cliente = $usuariosTable->find('all', [
				'conditions' => ['Usuarios.id' => $visita['cliente_usuario_id']]
			])->first()->toArray();
			$cliente = json_decode(json_encode($cliente), true);

			$to = '';
			if ($visita['firma_emails_notificar'] != '') {
				$to = explode(",", str_replace(" ", "", $visita['firma_emails_notificar']));
			} else if ($cliente['email'] != '') {
				$to = $cliente['email'];
			}
			if ($to != '') {
				$date = new DateTime($visita['fecha'], new DateTimeZone('GMT'));
				$subject = 'Visita ' . $date->format('d/m/Y');
				$contenido = "
					Estimados {$cliente['nombres']},
					<br>Nos comunicamos para notificar acerca de la visita realizada el " . $date->format('d/m/Y') . ", se puede observar los servicios prestados en el siguiente link: <a href='https://qapp.com.ar/mercofrio/api2/visitas/pdf/$id/{$cliente['id']}/1'>https://qapp.com.ar/mercofrio/api2/visitas/pdf/$id/{$cliente['id']}/1</a>
					<br>
					<br>Este correo ha sido generado automáticamente con fines informativos. Le agradecemos NO responder, ya que esta casilla no es revisada.	
					<br>
					<br>Muchas gracias,
					<br>Saludos cordiales.

					<br>
					<br><img src='http://qapp.com.ar/mercofrio/firma_email.png'>
				";
				try {
					$email = new Email();
					$email->transport('noreply');

					$email->from(['mercofrio.servicios@gmail.com' => 'Mercofrio'])
						->to($to)
						->subject($subject)
						->emailFormat('html')
						->send($contenido);

					$mensaje['tipo'] = 'success';
					$mensaje['texto'] = "Notificado a: " . implode(', ', $to);

					// Actualiza el estado de la visita a 'Notificada' (2)
					$dataTable->updateAll(['estado_id' => 2], ['id' => $id]);
				} catch (Exception $e) {
					$mensaje['tipo'] = 'error';
					$mensaje['texto'] = 'No se pudo notificar al cliente, intente nuevamente.';
				}

				///////////////////////////////
				// notifica a zona / sucursal (emails de zonas de responsable y empleado, deduplicados)
				///////////////////////////////

				// obtener zonas de responsable y empleado si existen
				$zonaEmails = [];

				try {
					$usuariosTable = TableRegistry::getTableLocator()->get('Usuarios');

					// Responsable
					if (!empty($visita['responsable_usuario_id'])) {
						$resp = $usuariosTable->find('all', [
							'conditions' => ['Usuarios.id' => $visita['responsable_usuario_id']],
							'contain' => ['Zonas']
						])->first();
						if ($resp && !empty($resp->zona_id)) {
							$zonaResp = TableRegistry::getTableLocator()->get('Zonas')->find('all', [
								'conditions' => ['Zonas.id' => $resp->zona_id]
							])->first();
							if ($zonaResp && !empty($zonaResp->emails)) {
								$zonaEmails[] = $zonaResp->emails;
							}
						}
					}

					// Empleado / acompañante
					if (!empty($visita['empleado_usuario_id'])) {
						$emp = $usuariosTable->find('all', [
							'conditions' => ['Usuarios.id' => $visita['empleado_usuario_id']],
							'contain' => ['Zonas']
						])->first();
						if ($emp && !empty($emp->zona_id)) {
							$zonaEmp = TableRegistry::getTableLocator()->get('Zonas')->find('all', [
								'conditions' => ['Zonas.id' => $emp->zona_id]
							])->first();
							if ($zonaEmp && !empty($zonaEmp->emails)) {
								$zonaEmails[] = $zonaEmp->emails;
							}
						}
					}
				} catch (\Exception $e) {
					// si algo falla, fallback a la zona de la visita
					if (!empty($zona['emails'])) {
						$zonaEmails[] = $zona['emails'];
					}
				}

				// incluir también la zona principal de la visita si no está vacía
				if (!empty($zona['emails'])) {
					$zonaEmails[] = $zona['emails'];
				}

				// juntar todos los emails, limpiar espacios y separar por comas
				$allEmails = [];
				foreach ($zonaEmails as $emStr) {
					// normalizar y separar
					$emStr = str_replace(' ', '', $emStr);
					if ($emStr === '') {
						continue;
					}
					$parts = explode(',', $emStr);
					foreach ($parts as $e) {
						$e = trim($e);
						if ($e !== '') {
							$allEmails[] = $e;
						}
					}
				}

				// deduplicar
				$allEmails = array_values(array_unique($allEmails));

				if (empty($allEmails)) {
					$mensaje['texto'] = 'No se ha ingresado el email del cliente ni de las zonas.';
				} else {
					$to = $allEmails;
					$fecha = $date->format('d/m/Y');
					// Visita N XXXXXXX Fecha: X/X/XXXX Cliente: XXXXXX Sucursal: XXXX (donde XXXX sea Rafaela, Bs As, Tucumán)

					$subject = "Visita N° {$visita['id']} Fecha: $fecha Cliente: {$cliente['nombres']} Sucursal: {$zona['nombre']} ";


					$contenido = "
						Se ha realizado el día $fecha el servicio N° {$visita['id']} al cliente {$cliente['nombres']}

						<br>
						<br>
						Se puede observar los servicios prestados en el siguiente link: <a href='https://qapp.com.ar/mercofrio/api2/visitas/pdf/$id/{$cliente['id']}'>https://qapp.com.ar/mercofrio/api2/visitas/pdf/$id/{$cliente['id']}</a>
                        
						<br>
						<br><img src='http://qapp.com.ar/mercofrio/firma_email.png'>
					";
					try {
						$email = new Email();
						$email->transport('noreply');

						$email->from(['mercofrio.servicios@gmail.com' => 'Mercofrio'])
							->to($to)
							->subject($subject)
							->emailFormat('html')
							->send($contenido);

						$mensaje['tipo'] = 'success';
						$mensaje['texto'] = "Notificado a: " . implode(', ', $to);

						// Actualiza el estado de la visita a 'Notificada' (2)
						$dataTable->updateAll(['estado_id' => 2], ['id' => $id]);
					} catch (Exception $e) {
						$mensaje['tipo'] = 'error';
						$mensaje['texto'] = 'No se pudo notificar a zona/sucursal, intente nuevamente.';
					}
				}

			} else {
				$mensaje['texto'] = 'No se ha ingresado el email del cliente.';
			}
		}

		$json = array();
		$json['mensaje'] = $mensaje;
		return $this->response->withType("application/json")->withStringBody(json_encode($json));
	}

	public function pdf($id = 0, $clienteId = 0, $inline = true){
		$this->autoRender = false;

		$url = '/files/pdf';
		$ruta = ROOT . "/../files/pdf";

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://www.qapp.com.ar/mercofrio/api2/visitas/listar?key=33712176399&banCompleto=true&id=$id&cliente_usuario_id=$clienteId");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HEADER, 0);

		// Deshabilitar verificación SSL (solo para desarrollo)
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		
		$data = json_decode(curl_exec($ch), true);
		curl_close($ch);

		if (!isset($data['visitas'][0])) {
			return null;
		} else {
			$visita = $data['visitas'][0];
		}

		$fechaVisita = new DateTime($visita['fecha'], new DateTimeZone('GMT'));

		$usuariosTable = TableRegistry::getTableLocator()->get('Usuarios');
		$cliente = $usuariosTable->find('all', [
			'conditions' => ['Usuarios.id' => $visita['cliente_usuario_id']]
		])->first()->toArray();
		$cliente = json_decode(json_encode($cliente), true);

		$usuariosTable = TableRegistry::getTableLocator()->get('Usuarios');
		$responsable = $usuariosTable->find('all', [
			'conditions' => ['Usuarios.id' => $visita['responsable_usuario_id']]
		])->first()->toArray();
		$responsable = json_decode(json_encode($responsable), true);

		$acompanante = ["apellido" => "", "nombres" => ""];
		if ($visita['empleado_usuario_id']) {
			$acompanante = $usuariosTable->find('all', [
				'conditions' => ['Usuarios.id' => $visita['empleado_usuario_id']]
			])->first()->toArray();
			$acompanante = json_decode(json_encode($acompanante), true);
		}

		$vehiculosTable = TableRegistry::getTableLocator()->get('Vehiculos');
		$vehiculo = null;
		if (isset($visita['vehiculo_id']) && $visita['vehiculo_id']) {
			$vehiculoResult = $vehiculosTable->find('all', [
				'conditions' => ['Vehiculos.id' => $visita['vehiculo_id']]
			])->first();
			if ($vehiculoResult) {
				$vehiculo = $vehiculoResult->toArray();
				$vehiculo = json_decode(json_encode($vehiculo), true);
			}
		}

		// Cargar técnicos adicionales (visitas_usuarios)
		$tecnicosAdicionales = [];
		if (isset($visita['visitas_usuarios']) && is_array($visita['visitas_usuarios']) && !empty($visita['visitas_usuarios'])) {
			foreach ($visita['visitas_usuarios'] as $usuarioId) {
				$tecnico = $usuariosTable->find('all', [
					'conditions' => ['Usuarios.id' => $usuarioId]
				])->first();
				if ($tecnico) {
					$tecnico = json_decode(json_encode($tecnico->toArray()), true);
					$tecnicosAdicionales[] = $tecnico;
				}
			}
		}

		// Cargar vehículos adicionales (visitas_vehiculos)
		$vehiculosAdicionales = [];
		if (isset($visita['visitas_vehiculos']) && is_array($visita['visitas_vehiculos']) && !empty($visita['visitas_vehiculos'])) {
			foreach ($visita['visitas_vehiculos'] as $vehiculoId) {
				$vehiculoAdicional = $vehiculosTable->find('all', [
					'conditions' => ['Vehiculos.id' => $vehiculoId]
				])->first();
				if ($vehiculoAdicional) {
					$vehiculoAdicional = json_decode(json_encode($vehiculoAdicional->toArray()), true);
					$vehiculosAdicionales[] = $vehiculoAdicional;
				}
			}
		}

		// empieza PDF

		include_once WWW_ROOT . '../vendor/html2pdf/html2pdf/autoload.php';

		$html2pdf = new Html2Pdf('P', 'A4', 'ES');

		$html2pdf->writeHTML(file_get_contents(WWW_ROOT . '../../files/template_pdf/head.html'));

		$html2pdf->writeHTML("
			<table >
			</table>
		");
		$html2pdf->writeHTML("<h3>{$cliente['nombres']}</h3>");

		$anchoCol = '350px';

		if ($visita['localidad'] == '') {
			$visita['localidad'] = 'S/D';
		}

		// Verificar si el vehículo tiene valor
		$tieneVehiculo = $vehiculo !== null && !empty($vehiculo) && 
			((isset($vehiculo['nombre']) && $vehiculo['nombre'] != '') || 
			 (isset($vehiculo['marca']) && $vehiculo['marca'] != '') || 
			 (isset($vehiculo['modelo']) && $vehiculo['modelo'] != '') || 
			 (isset($vehiculo['patente']) && $vehiculo['patente'] != ''));

		// Verificar si el acompañante tiene valor
		$tieneAcompanante = isset($acompanante) && !empty($acompanante) && 
			((isset($acompanante['nombres']) && $acompanante['nombres'] != '') || 
			 (isset($acompanante['apellido']) && $acompanante['apellido'] != ''));

		$htmlTabla = "
			<table >
			<tr>
				<td style='width:$anchoCol'>
				<b>Nro. Visita:</b> {$visita['id']}
				</td>
				<td>
				<b>Fecha Visita:</b> " . $fechaVisita->format('d/m/Y') . "
				</td>
			</tr>
			<tr>
				<td style='width:$anchoCol'>
				<b>Localidad:</b> {$visita['localidad']}
				</td>
				<td>
				<b>Total horas de viaje:</b> {$visita['horas_viaje']} hs
				</td>
			</tr>
			<tr>
				<td style='width:$anchoCol'>
				<b>Domicilio:</b> {$visita['domicilio']}
				</td>
				<td>
				<b>Total Kilómetros:</b> {$visita['km_recorridos']} km
				</td>
			</tr>";

		// Mostrar vehículo solo si tiene valor
		if ($tieneVehiculo) {
			$htmlTabla .= "
			<tr>
				<td style='width:$anchoCol'>
				<b>Vehículo:</b> {$vehiculo['nombre']} {$vehiculo['marca']} {$vehiculo['modelo']} - {$vehiculo['patente']}
				</td>
				<td style='width:$anchoCol'>
				<b>Total horas trabajadas:</b> {$visita['horas_trabajadas']}
				</td>
			</tr>";
		} else {
			$htmlTabla .= "
			<tr>
				<td style='width:$anchoCol'>
				<b>Total horas trabajadas:</b> {$visita['horas_trabajadas']}
				</td>
				<td></td>
			</tr>";
		}

		// Mostrar responsable y acompañante
		$htmlTabla .= "
			<tr>
				<td style='width:$anchoCol'>
				<b>Responsable:</b> {$responsable['nombres']} {$responsable['apellido']}
				</td>";

		// Mostrar acompañante solo si tiene valor
		if ($tieneAcompanante) {
			$htmlTabla .= "
				<td style='width:$anchoCol'>
				<b>Acompañante:</b> {$acompanante['nombres']} {$acompanante['apellido']}
				</td>";
		}

		$htmlTabla .= "
			</tr>
			</table>
		";

		$html2pdf->writeHTML($htmlTabla);

		// Mostrar técnicos adicionales
		if (!empty($tecnicosAdicionales)) {
			$htmlTecnicos = "<div style='margin-top:10px'><b>Técnicos que asistieron:</b></div><table>";
			foreach ($tecnicosAdicionales as $tecnico) {
				$htmlTecnicos .= "
					<tr>
						<td style='width:$anchoCol'>
						<b>Técnico:</b> {$tecnico['nombres']} {$tecnico['apellido']}
						</td>
					</tr>
				";
			}
			$htmlTecnicos .= "</table>";
			$html2pdf->writeHTML($htmlTecnicos);
		}

		// Mostrar vehículos adicionales
		if (!empty($vehiculosAdicionales)) {
			$htmlVehiculos = "<div style='margin-top:10px'><b>Vehículos utilizados:</b></div><table>";
			foreach ($vehiculosAdicionales as $vehiculoAdicional) {
				$htmlVehiculos .= "
					<tr>
						<td style='width:$anchoCol'>
						<b>Vehículo:</b> {$vehiculoAdicional['nombre']} {$vehiculoAdicional['marca']} {$vehiculoAdicional['modelo']} - {$vehiculoAdicional['patente']}
						</td>
					</tr>
				";
			}
			$htmlVehiculos .= "</table>";
			$html2pdf->writeHTML($htmlVehiculos);
		}

		$dtMultimedias = TableRegistry::getTableLocator()->get('Multimedias');
		$html2pdf->writeHTML("<div style='margin-top:10px'><b>Servicios realizados:</b></div>");
		foreach ($visita['servicios'] as $servicio) {
			$anchoColServicio = '350px';

			//print_r($servicio); echo "<hr>";

			$textoEnGarantia = "";
			if ($servicio['en_garantia']) {
				$textoEnGarantia = " (En garantia)";
			}

			//<b>Servicio:</b> #{$servicio['servicio_nro']} - {$servicio['serviciostipo']['nombre']} $textoEnGarantia

			$html = "
				<hr>
				<table>
				<tr>
					<td style='width:$anchoColServicio'>
					<b>Servicio:</b> #{$servicio['id']} - {$servicio['serviciostipo']['nombre']} $textoEnGarantia
					</td>
					<td>
					<b>Modelo:</b> {$servicio['modelo_nombre']} - {$servicio['marca']['nombre']}
					</td>
				</tr>
				<tr>
					<td>
					<b>Horas de marcha:</b> {$servicio['horas_marcha']}
					</td>	
					<td>
					<b>Equipo nro:</b> {$servicio['equipo_nro']}
					</td>					
				</tr>	
				<tr>
					<td>
					<b>Orden de venta:</b> {$servicio['orden_venta']}
					</td>	
					<td>
					<b>Nro de remito:</b> {$servicio['nro_remito']}
					</td>				
				</tr>	
			";


			$multimedias = $dtMultimedias->find('all', [
				'conditions' => ['Multimedias.servicio_id' => $servicio['id']]
			])->toArray();

			/**
			 * FOTOS ANTES DEL SERVICIO
			 */

			$html .= "	
				<tr>
					<td>
					<b>Fotos antes del servicio:</b>
					</td>				
				</tr>	
			";

			$cant = 0;
			$columna = 0;

			foreach ($multimedias as $m) {
				if ($m['tipo'] == 0) {
					if ($columna == 0) {
						$html .= "<tr>"; // Comienza nueva fila
					}

					$html .= "
						<td>
							<img src='../../files/multimedias_v2/{$m['codigo']}' style='max-width:400px; max-height:400px;'>
						</td>
					";

					$columna++;
					$cant++;

					if ($columna == 2) {
						$html .= "</tr>"; // Cierra la fila
						$columna = 0;
					}
				}
			}
			// Si quedan columnas abiertas al final, cerramos la fila
			if ($columna > 0) {
				$html .= "</tr>";
			}

			if ($cant == 0) {
				$html .= "	
					<tr>
						<td>
						<b>No se cargaron fotos.</b>
						</td>				
					</tr>	
				";
			}
			/**
			 * END !!! FOTOS ANTES DEL SERVICIO
			 */

			/**
			 * FOTOS DESPUES DEL SERVICIO
			 */

			$html .= "	
				<tr>
					<td>
					<b>Fotos después del servicio:</b>
					</td>				
				</tr>	
			";

			$cant = 0;
			$columna = 0;

			foreach ($multimedias as $m) {
				if ($m['tipo'] == 1) {
					if ($columna == 0) {
						$html .= "<tr>"; // Comienza nueva fila
					}

					$html .= "
						<td>
							<img src='../../files/multimedias_v2/{$m['codigo']}' style='max-width:400px; max-height:400px;'>
						</td>
					";

					$columna++;
					$cant++;

					if ($columna == 2) {
						$html .= "</tr>"; // Cierra la fila
						$columna = 0;
					}
				}
			}
			// Si quedan columnas abiertas al final, cerramos la fila
			if ($columna > 0) {
				$html .= "</tr>";
			}

			if ($cant == 0) {
				$html .= "	
					<tr>
						<td>
						<b>No se cargaron fotos.</b>
						</td>				
					</tr>	
				";
			}
			/**
			 * END !!! FOTOS DESPUES DEL SERVICIO
			 */


			$html .= "		
				</table>
			";

			$html2pdf->writeHTML($html);

			$anchoColTrabajosRepuestos = '600px';
			$html = "<table>";
			foreach ($servicio['trabajos'] as $trabajo) {
				$observacionHtml = nl2br($trabajo['observacion']);
				$html .= "
					<tr>
						<td style='width:$anchoColTrabajosRepuestos'>
						<b>Trabajo realizado:</b> {$observacionHtml}
						</td>
					</tr>
				";
			}
			$html .= "</table>";
			$html2pdf->writeHTML($html);

			$anchoColTrabajosRepuestos = '600px';
			$html = "<table>";
			if ($servicio['descripcion'] && ($servicio['descripcion'] != '')) {
				$html .= "
					<tr>
						<td style='width:$anchoColTrabajosRepuestos'>
						<b>Recomendaciones:</b> {$servicio['descripcion']}
						</td>
					</tr>
				";
			}
			$html .= "</table>";
			$html2pdf->writeHTML($html);


			$sinRepuestos = "";
			if (sizeOf($servicio['repuestos']) == 0) {
				$sinRepuestos = "No se utilizaron repuestos.";
			}

			$html = "<table>";
			$html .= "
				<tr>
					<td style='width:$anchoColTrabajosRepuestos'>
					<b>Repuesto utilizado:</b> $sinRepuestos
					</td>
				</tr>
			";
			foreach ($servicio['repuestos'] as $repuestos) {
				$html .= "
					<tr>
						<td style='width:$anchoColTrabajosRepuestos'>
						<b>{$repuestos['cantidad']}x</b> {$repuestos['nombre']} - {$repuestos['observacion']}
						</td>
					</tr>
				";
			}
			$html .= "</table>";
			$html2pdf->writeHTML($html);
		}

		$html2pdf->writeHTML("<hr>");

		if (isset($visita['firma'])) {
			$html2pdf->writeHTML("
				<table>
				<tr>
					<td style='width:400px'></td>
					<td style='width:200px'>
						<div style='margin-top:50x 10px 0 0; text-align:center'>
						Firma y aclaración del cliente:<br><br>
						<img style='height:80px' src='../../files/multimedias_v2/{$visita['firma']['codigo']}'>
						<br>{$visita['firma_aclaracion']}
						</div>
					</td>
				</tr>
				</table>
			");
		}


		header("Content-type: application/pdf");
		// header("Content-Disposition: inline; filename=registro_servicio.pdf");
		//header("Content-Disposition:attachment;filename='downloaded.pdf'");
		// guarda
		$uniqid = uniqid();
		//echo json_encode(['url'=>$url.'/'.$uniqid.'.pdf']);

		// mostrar en el navegador
		if ($inline) {
			$html2pdf->output('registro_servicio.pdf', 'I');
		} else {
			$html2pdf->output('registro_servicio.pdf', 'D');
		}
	}

	public function pdftest($id = 1, $clienteId = 6)
	{
		$this->autoRender = false;

		$url = '/files/pdf';
		$ruta = ROOT . "/../files/pdf";

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://www.qapp.com.ar/mercofrio/api2/visitas/listar?key=33712176399&banCompleto=true&id=$id&cliente_usuario_id=$clienteId");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		$data = json_decode(curl_exec($ch), true);
		curl_close($ch);

		if (!isset($data['visitas'][0])) {
			return null;
		} else {
			$visita = $data['visitas'][0];
		}

		$fechaVisita = new DateTime($visita['fecha'], new DateTimeZone('GMT'));

		$usuariosTable = TableRegistry::getTableLocator()->get('Usuarios');
		$cliente = $usuariosTable->find('all', [
			'conditions' => ['Usuarios.id' => $visita['cliente_usuario_id']]
		])->first()->toArray();
		$cliente = json_decode(json_encode($cliente), true);

		$usuariosTable = TableRegistry::getTableLocator()->get('Usuarios');
		$responsable = $usuariosTable->find('all', [
			'conditions' => ['Usuarios.id' => $visita['responsable_usuario_id']]
		])->first()->toArray();
		$responsable = json_decode(json_encode($responsable), true);

		$vehiculosTable = TableRegistry::getTableLocator()->get('Vehiculos');
		$vehiculo = $vehiculosTable->find('all', [
			'conditions' => ['Vehiculos.id' => $visita['vehiculo_id']]
		])->first()->toArray();
		$vehiculo = json_decode(json_encode($vehiculo), true);

		// empieza PDF

		include_once WWW_ROOT . '../vendor/html2pdf/html2pdf/autoload.php';

		$html2pdf = new Html2Pdf('P', 'A4', 'ES');

		$html2pdf->writeHTML(file_get_contents(WWW_ROOT . '../../files/template_pdf/head.html'));

		$html2pdf->writeHTML("
			<table >
			</table>
		");
		$html2pdf->writeHTML("<h3>{$cliente['nombres']}</h3>");

		$anchoCol = '350px';
		$html2pdf->writeHTML("
			<table >
			<tr>
				<td style='width:$anchoCol'>
				<b>Nro. Visita:</b> {$visita['id']}
				</td>
				<td>
				<b>Fecha Visita:</b> " . $fechaVisita->format('d/m/Y') . "
				</td>
			</tr>
			<tr>
				<td style='width:$anchoCol' colspan=2>
				<b>Realizado por:</b> {$responsable['nombres']} {$responsable['apellido']}
				</td>
			</tr>
			<tr>
				<td style='width:$anchoCol'>
				<b>Vehículo:</b> {$vehiculo['nombre']} {$vehiculo['marca']} {$vehiculo['modelo']} - {$vehiculo['patente']}
				</td>
				<td>
				<b>Total Kilómetros:</b> {$visita['km_recorridos']} km
				</td>
			</tr>
			<tr>
				<td style='width:$anchoCol'>
				<b>Total horas trabajadas:</b> {$visita['horas_trabajadas']} hs
				</td>
				<td>
				<b>Total horas de viaje:</b> {$visita['horas_viaje']} hs
				</td>
			</tr>
			</table>
		");

		$html2pdf->writeHTML("<div style='margin-top:10px'><b>Servicios realizados:</b></div>");
		foreach ($visita['servicios'] as $servicio) {
			$anchoColServicio = '350px';

			//print_r($servicio); echo "<hr>";

			$textoEnGarantia = "";
			if ($servicio['en_garantia']) {
				$textoEnGarantia = " (En garantia)";
			}

			$html2pdf->writeHTML("
				<hr>
				<table>
				<tr>
					<td style='width:$anchoColServicio'>
					<b>Servicio:</b> #{$servicio['id']} - {$servicio['serviciostipo']['nombre']} $textoEnGarantia
					</td>
					<td>
					<b>Modelo:</b> {$servicio['modelo']['nombre']} - {$servicio['modelo']['linea']['nombre']} - {$servicio['modelo']['linea']['marca']['nombre']}
					</td>				
				</tr>
				<tr>
					<td>
					<b>Horas de marcha:</b> {$servicio['horas_marcha']}
					</td>	
					<td>
					<b>Equipo nro:</b> {$servicio['equipo_nro']}
					</td>					
				</tr>
				</table>
			");
			$anchoColTrabajosRepuestos = '600px';
			$html = "<table>";
			foreach ($servicio['trabajos'] as $trabajo) {
				$html .= "
					<tr>
						<td style='width:$anchoColTrabajosRepuestos'>
						<b>Trabajo realizado:</b> {$trabajo['observacion']}
						</td>
					</tr>
				";
			}
			$html .= "</table>";
			$html2pdf->writeHTML($html);

			$html = "<table>";
			foreach ($servicio['repuestos'] as $repuestos) {
				$html .= "
					<tr>
						<td style='width:$anchoColTrabajosRepuestos'>
						<b>Repuesto utilizado:</b> {$repuestos['nombre']} - {$repuestos['observacion']}
						</td>
					</tr>
				";
			}
			$html .= "</table>";
			$html2pdf->writeHTML($html);
		}

		$html2pdf->writeHTML("<hr>");

		if (isset($visita['firma'])) {
			$html2pdf->writeHTML("
				<table>
				<tr>
					<td style='width:400px'></td>
					<td style='width:200px'>
						<div style='margin-top:50x 10px 0 0; text-align:center'>
						Firma y aclaración del cliente:<br><br>
						<img style='height:80px' src='https://www.qapp.com.ar/mercofrio/files/multimedias_v2/{$visita['firma']['codigo']}'>
						<br>{$visita['firma_aclaracion']}
						</div>
					</td>
				</tr>
				</table>
			");
		}


		header("Content-type: application/pdf");
		// header("Content-Disposition: inline; filename=registro_servicio.pdf");
		//header("Content-Disposition:attachment;filename='downloaded.pdf'");
		// guarda
		$uniqid = uniqid();
		$html2pdf->output('registro_servicio.pdf', 'I');
		//echo json_encode(['url'=>$url.'/'.$uniqid.'.pdf']);
	}

}
