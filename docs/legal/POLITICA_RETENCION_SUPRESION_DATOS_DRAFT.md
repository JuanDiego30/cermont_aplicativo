# Política de Retención y Supresión de Datos Personales

**Versión borrador:** 1.0  
**Fecha:** 2026-06-24  
**Estado:** ⚠️ BORRADOR TÉCNICO — REQUIERE REVISIÓN LEGAL ANTES DE USO  

---

## 1. Objetivo

Establecer los períodos de retención y los procedimientos de supresión de datos personales tratados por Cermont S.A.S., cumpliendo con los principios de finalidad, necesidad y temporalidad establecidos en la Ley 1581 de 2012.

## 2. Principios

### 2.1 Principio de necesidad
Solo se recolectan y retienen los datos personales estrictamente necesarios para la finalidad declarada.

### 2.2 Principio de temporalidad
Los datos se conservan únicamente mientras sean necesarios para la finalidad. Una vez cumplida, se procede a su supresión o anonimización.

### 2.3 Principio de finalidad
Los datos no se conservan más allá del tiempo requerido para cumplir la finalidad para la cual fueron recolectados.

## 3. Períodos de Retención por Categoría

| Categoría | Período de retención | Fundamento |
|-----------|----------------------|------------|
| Datos de usuario activo | Mientras la cuenta esté activa | Necesidad del servicio |
| Historial de actividades | 5 años después del cierre del servicio | Trazabilidad contractual |
| Facturación y pagos | 10 años | Obligación fiscal (Estatuto Tributario) |
| Evidencias fotográficas | 5 años después del cierre del servicio | Trazabilidad y garantía |
| Datos de geolocalización | 5 años después del cierre del servicio | Trazabilidad |
| Registros de auditoría | 5 años | Seguridad y cumplimiento |
| Contratos y documentos legales | 10 años después de terminación | Obligación legal |
| Consentimientos | 5 años después de revocatoria | Prueba de autorización |
| Datos de candidatos (no contratados) | 2 años | Procesos de selección |
| Cookies y datos de navegación | 12 meses | Análisis y mejora |

## 4. Tipos de Supresión

### 4.1 Supresión lógica (soft delete)
- El dato se marca como eliminado pero persiste en la base de datos.
- No es accesible desde la aplicación.
- Utilizado para: registros de auditoría, consentimientos, datos con obligación legal de conservación.

### 4.2 Anonimización
- El dato se transforma irreversiblemente para que no pueda asociarse a una persona identificada o identificable.
- Utilizado para: datos analíticos, reportes estadísticos.

### 4.3 Supresión física (hard delete)
- El dato se elimina físicamente de la base de datos y backups.
- Utilizado para: datos cuya retención ya no tiene ningún fundamento legal.

## 5. Procedimiento de Supresión

### 5.1 Solicitud del Titular
1. El Titular presenta solicitud de supresión.
2. Se verifica identidad y procedencia.
3. Si procede, se ejecuta la supresión según el tipo aplicable.
4. Se registra en auditoría.
5. Se notifica al Titular.

### 5.2 Supresión programada
1. Se revisan periódicamente los datos cuyo período de retención ha vencido.
2. Se ejecuta supresión por lotes.
3. Se registra en auditoría.

## 6. Excepciones

No se procederá a la supresión cuando:

- Exista obligación legal de conservar los datos.
- Los datos sean necesarios para defensa judicial.
- Exista relación contractual vigente que los requiera.
- La supresión afecte derechos de terceros.
- Exista orden de autoridad que impida la supresión.

## 7. Registro de Supresión

Cada supresión debe registrar:

| Campo | Descripción |
|-------|-------------|
| Fecha | Cuándo se realizó |
| Tipo | Lógica, anonimización o física |
| Datos suprimidos | Categoría y alcance |
| Titular | Identificador del titular |
| Fundamento | Causa de la supresión |
| Autorizado por | Quién autorizó |
| Método | Cómo se ejecutó |

## 8. Backups

Los datos suprimidos físicamente también se eliminan de los backups en el ciclo regular de rotación, sin exceder el período máximo de retención de backups (90 días).

---

**Última actualización:** 2026-06-24  
**Revisión legal:** ⏳ PENDIENTE
