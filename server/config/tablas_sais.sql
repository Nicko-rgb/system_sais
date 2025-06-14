-- Active: 1743786824105@@127.0.0.1@3306@db_sais
CREATE DATABASE IF NOT EXISTS db_sais;
USE db_sais;

-- TABLA RESPONSABLE DE PACIENTE
CREATE TABLE responsable_de_paciente (
    id_responsable INT AUTO_INCREMENT PRIMARY KEY,
    dni_res VARCHAR(8) NOT NULL,
    tipo_res VARCHAR(50) NOT NULL,
    ape_paterno_res VARCHAR(50) NOT NULL,
    ape_materno_res VARCHAR(50) NOT NULL,
    nombres_res VARCHAR(100) NOT NULL,
    celular1_res VARCHAR(20),
    celular2_res VARCHAR(20),
    localidad_res VARCHAR(50),
    sector_res VARCHAR(20),
    direccion_res VARCHAR(100),
    departamento_res VARCHAR(50),
    provincia_res VARCHAR(50),
    distrito_res VARCHAR(50)
);

-- TABLA PACIENTES
CREATE TABLE pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    cnv_linea VARCHAR(50),
    hist_clinico VARCHAR(50) UNIQUE NOT NULL,
    ape_paterno VARCHAR(50) NOT NULL,
    ape_materno VARCHAR(50) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad INT NOT NULL,
    sexo VARCHAR(40) NOT NULL,
    discapacidad VARCHAR(50),
    celular1 VARCHAR(15),
    celular2 VARCHAR(15),
    localidad VARCHAR(50),
    sector VARCHAR(20),
    direccion VARCHAR(100),
    departamento VARCHAR(50),
    provincia VARCHAR(50),
    distrito VARCHAR(50),
    tipo_paciente VARCHAR(50) NOT NULL,
    is_jefe BOOLEAN NOT NULL DEFAULT FALSE,
    id_responsable INT,
    FOREIGN KEY (id_responsable) REFERENCES responsable_de_paciente (id_responsable) ON DELETE SET NULL,
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_ficha INT,
    FOREIGN KEY (id_ficha) REFERENCES ficha_familiar (id_ficha) ON DELETE SET NULL
);

-- TABLA FICHAS FAMILIAR - CARPETAS FAMILIARES
CREATE TABLE ficha_familiar (
    id_ficha INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ficha VARCHAR(20) NOT NULL UNIQUE, -- Ej: MBA001-01A
    manzana VARCHAR(6) NOT NULL,              -- Ej: MBA001 o MBB001
    vivienda_numero VARCHAR(3) NOT NULL,      -- Ej: 01, 02, etc.
    grupo_familiar CHAR(1) NOT NULL,          -- Ej: A, B, C
    direccion VARCHAR(100),
    localidad VARCHAR(50),
    sector VARCHAR(20),
    distrito VARCHAR(50),
    jefe_familia VARCHAR(200),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE ESPECIALIADADES DISPONIBLES EN CITAS
CREATE TABLE especialidades_cita (
    id_especi INT AUTO_INCREMENT PRIMARY KEY,
    especialidad VARCHAR(100) NOT NULL UNIQUE,
    consultorios TINYINT NOT NULL DEFAULT 1,
    icono LONGBLOB,
    ico_name VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- TABLA CITAS 
CREATE TABLE cita_ninhos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT,
  especialidad VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(20) NOT NULL,
  consultorio INT NOT NULL,
  telefono VARCHAR(20),
  direccion_c VARCHAR(100),
  motivoConsulta VARCHAR(1000) NOT NULL,
  metodo VARCHAR(100),
  semEmbarazo INT,
  profesional_cita VARCHAR(100) NOT NULL,
  id_responsable INT,
  FOREIGN KEY (id_responsable) REFERENCES responsable_de_paciente (id_responsable) ON DELETE SET NULL,
  FOREIGN KEY (id_paciente) REFERENCES pacientes (id_paciente) ON DELETE CASCADE,
  fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE UNIQUE INDEX idx_unico_horario ON cita_ninhos (
    especialidad,
    fecha,
    hora,
    consultorio
);

-- TABLA DE HORARIOS PARA CITAS NIÑO
CREATE TABLE horario_cita_nino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_especialidad INT NOT NULL,
    turno VARCHAR(10),
    tipo_atencion VARCHAR(20),
    hora_inicio TIME,
    hora_fin TIME,
    FOREIGN KEY (id_especialidad) REFERENCES especialidades_cita (id_especi) ON DELETE CASCADE
);


-- TABLA PARA MANEJAR LOS HORARIOS BLOQUEADOS EN CITAS
CREATE TABLE hora_cita_nino_bloqueada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(20) NOT NULL,
    hora_fin VARCHAR(20) NOT NULL,
    consultorio VARCHAR(50) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    UNIQUE (
        fecha,
        hora_inicio,
        hora_fin,
        consultorio
    )
);

-- TABLA PARA REGISTRAR A LOS PERSONALES DE SALUD
CREATE TABLE personal_salud (
    id_personal INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) NOT NULL,
    paterno VARCHAR(50) NOT NULL,
    materno VARCHAR(50) NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    tipo_user VARCHAR(30) NULL, -- Campo que guarda el rol de personal "Administrador", "Jefe" o "Responsable"
    tipo_personal VARCHAR(50) NOT NULL ,
    id_profesion INT,
    id_servicio INT,
    especial_cita VARCHAR(50),
    num_consultorio VARCHAR(10),
    condicion VARCHAR(30) NULL,
    celular VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(50) NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'activo',
    reset_token VARCHAR(255) DEFAULT NULL,
    file LONGBLOB,
    file_name VARCHAR(255),
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_profesion) REFERENCES profesiones(id_profesion) ON DEFAULT SET NULL,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL
);

-- --------------------------------------------------------
CREATE TABLE profesiones (
    id_profesion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_profesion varchar(50) NOT NULL UNIQUE
);
-- --------------------------------------------------------
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio varchar(50) NOT NULL UNIQUE
);

-- CREAMOS UNA TABLA PARA REGISTRAR TURNOS DE PERSONALES
CREATE TABLE turnos_personal (
    id_turno INT AUTO_INCREMENT PRIMARY KEY,
    id_personal INT,
    FOREIGN KEY (id_personal) REFERENCES personal_salud (id_personal) ON DELETE CASCADE, -- Elimina turnos relacionados si se elimina el personal
    id_turno_tipo INT NOT NULL, -- Relación a una tabla de tipos de turnos
    FOREIGN KEY (id_turno_tipo) REFERENCES tipos_turno_personal (id_turno_tipo), -- Clave foránea para tipos de turno
    fecha DATE NOT NULL,
    UNIQUE (id_personal, fecha) -- Evitar turnos duplicados en la misma fecha para el mismo personal
);

-- TABLA DE TIPOS DE TURNO PARA PERSONAL
CREATE TABLE tipos_turno_personal (
    id_turno_tipo INT AUTO_INCREMENT PRIMARY KEY,
    turno VARCHAR(100) NOT NULL,
    clave_turno VARCHAR(50) NOT NULL
);

-- TABLA PARA MANEJAR DIAS BLOQUEADOS EN TURNOS PERSONAL
CREATE TABLE dias_bloqueados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (fecha) -- Para evitar duplicados de la misma fecha
);



-- TABLA PARA ASIGNACION DE SECTOR AL PERSONAL
CREATE TABLE sector_personal (
    id_sector_personal INT AUTO_INCREMENT PRIMARY KEY,
    -- id_sector es id_manzana
    id_sector INT(11) NOT NULL,
    manzana VARCHAR(100),
    codigo VARCHAR(50) NOT NULL,
    numero INT(11) NOT NULL,
    descripcion VARCHAR(100),
    id_personal INT(11),
    FOREIGN KEY (id_personal) REFERENCES personal_salud (id_personal) ON DELETE SET NULL,
    UNIQUE (id_sector, id_personal) 
);

-- TABLA PARA REGISTRO DE NOTAS EN CADA MANZANA
CREATE TABLE notas_manzana (
    id_notas_manzana INT AUTO_INCREMENT PRIMARY KEY,
    id_manzana INT(11) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    manzana VARCHAR(100) NOT NULL,
    nota VARCHAR(1000) NOT NULL,
    fecha_recordatorio VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE config_system (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    nombre_config VARCHAR(100) NOT NULL,
    valorTxt VARCHAR(255),
    valorBln BOOLEAN DEFAULT TRUE
)

INSERT INTO config_system (nombre_config, valorTxt, valorBln) VALUES 
('dni_historia', 'no', FALSE);