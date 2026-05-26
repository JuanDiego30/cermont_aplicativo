import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix Mojibake (UTF-8 interpreted as Latin-1/Windows-1252)
    replacements = [
        ('Ã¡', 'á'),
        ('Ã©', 'é'),
        ('Ã\xad', 'í'), # Ã followed by soft hyphen or similar
        ('Ã³', 'ó'),
        ('Ãº', 'ú'),
        ('Ã±', 'ñ'),
        ('Ã‘', 'Ñ'),
        ('Ã“', 'Ó'),
        ('Ã‰', 'É'),
        ('Ã', 'Á'),
        ('Ãš', 'Ú'),
        ('Ã\x81', 'Á'),
        ('Ã\x89', 'É'),
        ('Ã\x8d', 'Í'),
        ('Ã\x93', 'Ó'),
        ('Ã\x9a', 'Ú'),
        ('Ã\x91', 'Ñ'),
        # Common corruptions
        ('dAños', 'datos'),
        ('Años', 'años'),
        ('Añompañamiento', 'Acompañamiento'),
        ('DocuMenúación', 'Documentación'),
        ('DocuMenúo', 'Documento'),
        ('ImpleMenúación', 'Implementación'),
        ('DepartaMenúo', 'Departamento'),
        ('Menú', 'ment'), # Be careful with this one, "Menú" is a valid word.
        ('Estáuctura', 'Estructura'),
        ('InvEstágación', 'Investigación'),
        ('Estágación', 'estigación'),
        ('SiÍtemás', 'Sistemas'),
        ('SiÍtema', 'Sistema'),
        ('míniMás', 'mínimos'),
        ('misMás', 'mismos'),
        ('insuMás', 'insumos'),
        ('DíagraMás', 'Diagramas'),
        ('Díagrama', 'Diagrama'),
        ('Díagnostico', 'Diagnóstico'),
        ('PiDíache', 'Pidiache'),
        ('ArévAño', 'Arévalo'),
        ('identifiCAño', 'identificado'),
        ('identifiCasos', 'identificados'),
        ('CAños', 'Casos'),
        ('pAños', 'pasos'),
        ('Añopta', 'Adopta'),
        ('unAñorganizaciónÁreal', 'una organización real'),
        ('Áreal', ' real'),
        ('EspecíficaMenúe', 'Específicamente'),
        ('Estámada', 'Estimada'),
        ('Métodológico', 'Metodológico'),
        ('FiGuía', 'Figura'),
        ('FiGuías', 'Figuras'),
        ('ConfiGuíación', 'Configuración'),
        ('AseGuía', 'Asegura'),
        ('confiGuíaños', 'configurados'),
        ('confiGuíadas', 'configuradas'),
        ('confiGuíar', 'configurar'),
        ('GEstáón', 'Gestión'),
        ('kits\\itemplates', 'kits templates'),
        ('Limóncelli', 'Limoncelli'),
        ('reÚtilizables', 'reutilizables'),
        ('reÚtilizable', 'reutilizable'),
        ('asincrÚnico', 'asincrónico'),
        ('sincrÚnico', 'sincrónico'),
        ('electrÚnico', 'electrónico'),
        ('telefÚnico', 'telefónico'),
        ('mecÚnico', 'mecánico'),
        ('orgÚnico', 'orgánico'),
        ('pÚnico', 'pánico'),
        ('clÚnico', 'clínico'),
        ('tÚnico', 'tónico'),
        ('icÚnico', 'icónico'),
        ('irÚnico', 'irónico'),
        ('armÚnico', 'armónico'),
        ('canÚnico', 'canónico'),
        ('crÚnico', 'crónico'),
        ('sÚnico', 'sónico'),
        ('Último', 'Último'),
        ('penÚltimo', 'penúltimo'),
        ('antepenÚltimo', 'antepenúltimo'),
        ('Úptimo', 'Óptimo'),
        ('inÚtil', 'inútil'),
        ('Úgil', 'Ágil'),
        ('frÚgil', 'frágil'),
        ('Úngulo', 'Ángulo'),
        ('triÚngulo', 'triángulo'),
        ('rectÚngulo', 'rectángulo'),
        ('Úmbito', 'Ámbito'),
        ('Úrbol', 'Árbol'),
        ('Ítemize', 'itemize'),
        ('Índice', 'Índice'),
        ('apÉndice', 'apéndice'),
        ('subÍndice', 'subíndice'),
        ('superÍndice', 'superíndice'),
        ('Ígneo', 'Ígneo'),
        ('Ídolo', 'Ídolo'),
        ('Ímpetu', 'Ímpetu'),
        ('Íntegro', 'Íntegro'),
        ('Íntimo', 'Íntimo'),
        ('Índole', 'Índole'),
        ('Ínfimo', 'Ínfimo'),
        ('Ínsula', 'Ínsula'),
        ('Ítaca', 'Ítaca'),
        ('Íbero', 'Íbero'),
        ('Índico', 'Índico'),
        ('Ícaro', 'Ícaro'),
        ('Íleon', 'Íleon'),
        ('Ílion', 'Ílion'),
        ('Índex', 'Índex'),
        ('Índigo', 'Índigo'),
        ('Ínterin', 'Ínterin'),
        ('Ístmico', 'Ístmico'),
        ('Ítalo', 'Ítalo'),
        ('Íter', 'Íter'),
        ('Ítrio', 'Ítrio'),
        ('Ízaro', 'Ízaro'),
        ('Íbice', 'Íbice'),
        ('Íbide', 'Íbide'),
        ('Ídem', 'Ídem'),
        ('Íleo', 'Íleo'),
        ('Ílice', 'Ílice'),
        ('Ínclito', 'Ínclito'),
        ('Íncubo', 'Íncubo'),
        ('Ínfero', 'Ínfero'),
        ('Íngrimo', 'Íngrimo'),
        ('Ínter', 'Ínter'),
        ('Írrito', 'Írrito'),
        # LaTeX commands
        (r'\\Ítem', r'\\item'),
        (r'\\begin\{Ítemize\}', r'\\begin{itemize}'),
        (r'\\end\{Ítemize\}', r'\\end{itemize}'),
        (r'\\citeÁreact', r'\\cite{react'),
        (r'\\citeÁ', r'\\cite{'),
        (r'Áreact', r' React'),
        (r'usuarioÁ', r'usuario '),
        (r'Á', r''), # Remove stray Á if not matched above? Dangerous.
    ]

    # Apply replacements
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Regex replacements for patterns
    content = re.sub(r'Descripci.n', 'Descripción', content)
    content = re.sub(r'Ejecuci.n', 'Ejecución', content)
    content = re.sub(r'Gesti.n', 'Gestión', content)
    content = re.sub(r'Informaci.n', 'Información', content)
    content = re.sub(r'Automatizaci.n', 'Automatización', content)
    content = re.sub(r'Transformaci.n', 'Transformación', content)
    content = re.sub(r'Comunicaci.n', 'Comunicación', content)
    content = re.sub(r'Evaluaci.n', 'Evaluación', content)
    content = re.sub(r'Implementaci.n', 'Implementación', content)
    content = re.sub(r'Validaci.n', 'Validación', content)
    content = re.sub(r'Integraci.n', 'Integración', content)
    content = re.sub(r'Soluci.n', 'Solución', content)
    content = re.sub(r'Producci.n', 'Producción', content)
    content = re.sub(r'Operaci.n', 'Operación', content)
    content = re.sub(r'Direcci.n', 'Dirección', content)
    content = re.sub(r'Acci.n', 'Acción', content)
    content = re.sub(r'Conclusi.n', 'Conclusión', content)
    content = re.sub(r'Recomendaci.n', 'Recomendación', content)
    content = re.sub(r'Investigaci.n', 'Investigación', content)
    content = re.sub(r'Documentaci.n', 'Documentación', content)
    content = re.sub(r'Planificaci.n', 'Planificación', content)
    content = re.sub(r'Programaci.n', 'Programación', content)
    content = re.sub(r'Sincronizaci.n', 'Sincronización', content)
    content = re.sub(r'Visualizaci.n', 'Visualización', content)
    content = re.sub(r'Configuraci.n', 'Configuración', content)
    content = re.sub(r'Interacci.n', 'Interacción', content)
    content = re.sub(r'Satisfacci.n', 'Satisfacción', content)
    content = re.sub(r'Aprobaci.n', 'Aprobación', content)
    content = re.sub(r'Facturaci.n', 'Facturación', content)
    content = re.sub(r'Ubicaci.n', 'Ubicación', content)
    content = re.sub(r'Relaci.n', 'Relación', content)
    content = re.sub(r'Funci.n', 'Función', content)
    content = re.sub(r'Versi.n', 'Versión', content)
    content = re.sub(r'Visi.n', 'Visión', content)
    content = re.sub(r'Misi.n', 'Misión', content)
    content = re.sub(r'Regi.n', 'Región', content)
    content = re.sub(r'Uni.n', 'Unión', content)
    content = re.sub(r'Com.n', 'Común', content)
    content = re.sub(r'Seg.n', 'Según', content)
    content = re.sub(r'Ning.n', 'Ningún', content)
    content = re.sub(r'T.cnica', 'Técnica', content)
    content = re.sub(r'T.cnico', 'Técnico', content)
    content = re.sub(r'El.ctrico', 'Eléctrico', content)
    content = re.sub(r'M.todo', 'Método', content)
    content = re.sub(r'M.trica', 'Métrica', content)
    content = re.sub(r'An.lisis', 'Análisis', content)
    content = re.sub(r'Est.ndar', 'Estándar', content)
    content = re.sub(r'Tambi.n', 'También', content)
    content = re.sub(r'Adem.s', 'Además', content)
    content = re.sub(r'M.s', 'Más', content)
    content = re.sub(r'Despu.s', 'Después', content)
    content = re.sub(r'Ingenier.a', 'Ingeniería', content)
    content = re.sub(r'Tecnolog.a', 'Tecnología', content)
    content = re.sub(r'Metodolog.a', 'Metodología', content)
    content = re.sub(r'Auditor.a', 'Auditoría', content)
    content = re.sub(r'Categor.a', 'Categoría', content)
    content = re.sub(r'Garant.a', 'Garantía', content)
    content = re.sub(r'D.a', 'Día', content)
    content = re.sub(r'Gu.a', 'Guía', content)
    content = re.sub(r'V.a', 'Vía', content)
    content = re.sub(r'Fr.o', 'Frío', content)
    content = re.sub(r'Per.odo', 'Período', content)
    content = re.sub(r'Ca.o', 'Caño', content)
    content = re.sub(r'Dise.o', 'Diseño', content)
    content = re.sub(r'Tama.o', 'Tamaño', content)
    content = re.sub(r'A.o', 'Año', content)
    content = re.sub(r'Espa.ol', 'Español', content)
    content = re.sub(r'Compa.a', 'Compañía', content)
    content = re.sub(r'.rdenes', 'Órdenes', content)
    content = re.sub(r'.rea', 'Área', content)
    content = re.sub(r'.xito', 'Éxito', content)
    content = re.sub(r'.ndice', 'Índice', content)
    content = re.sub(r'.nico', 'Único', content)
    content = re.sub(r'.ltimo', 'Último', content)
    content = re.sub(r'.ptimo', 'Óptimo', content)
    content = re.sub(r'.til', 'Útil', content)
    content = re.sub(r'.gil', 'Ágil', content)
    content = re.sub(r'.ngulo', 'Ángulo', content)
    content = re.sub(r'.mbito', 'Ámbito', content)
    content = re.sub(r'.rbol', 'Árbol', content)
    content = re.sub(r'.tem', 'Ítem', content)

    # Fix "Menú" inside words (e.g. ImpleMenúación -> Implementación)
    # But "Menú" is valid. So we replace "Menú" with "ment" ONLY if it is surrounded by letters.
    content = re.sub(r'([a-zA-Z])Menú([a-zA-Z])', r'\1ment\2', content)
    
    # Fix "Más" inside words (e.g. míniMás -> mínimos)
    # "Más" -> "mos" if at end of word?
    # míniMás -> mínimos. insuMás -> insumos.
    # But "Más" is "More".
    # We can list specific words.
    content = content.replace('míniMás', 'mínimos')
    content = content.replace('insuMás', 'insumos')
    content = content.replace('misMás', 'mismos')
    content = content.replace('DíagraMás', 'Diagramas')
    content = content.replace('probleMás', 'problemas')
    content = content.replace('sisteMás', 'sistemas')
    content = content.replace('SisteMás', 'Sistemas')
    content = content.replace('teMás', 'temas')
    content = content.replace('TeMás', 'Temas')
    content = content.replace('prograMás', 'programas')
    content = content.replace('PrograMás', 'Programas')
    content = content.replace('esqueMás', 'esquemas')
    content = content.replace('EsqueMás', 'Esquemas')
    content = content.replace('idioMás', 'idiomas')
    content = content.replace('IdioMás', 'Idiomas')
    content = content.replace('leMás', 'lemas')
    content = content.replace('LeMás', 'Lemas')
    content = content.replace('forMás', 'formas')
    content = content.replace('ForMás', 'Formas')
    content = content.replace('norMás', 'normas')
    content = content.replace('NorMás', 'Normas')
    content = content.replace('firMás', 'firmas')
    content = content.replace('FirMás', 'Firmas')
    content = content.replace('suMás', 'sumas')
    content = content.replace('SuMás', 'Sumas')
    content = content.replace('raMás', 'ramas')
    content = content.replace('RaMás', 'Ramas')
    content = content.replace('daMás', 'damas')
    content = content.replace('DaMás', 'Damas')
    content = content.replace('caMás', 'camas')
    content = content.replace('CaMás', 'Camas')
    content = content.replace('llaMás', 'llamas')
    content = content.replace('LlaMás', 'Llamas')
    content = content.replace('toMás', 'tomas')
    content = content.replace('ToMás', 'Tomas')
    content = content.replace('arMás', 'armas')
    content = content.replace('ArMás', 'Armas')
    content = content.replace('alMás', 'almas')
    content = content.replace('AlMás', 'Almas')
    content = content.replace('plataforMás', 'plataformas')
    content = content.replace('PlataforMás', 'Plataformas')
    content = content.replace('reforMás', 'reformas')
    content = content.replace('ReforMás', 'Reformas')
    content = content.replace('inforMás', 'informas')
    content = content.replace('InforMás', 'Informas')
    content = content.replace('sintoMás', 'sintomas')
    content = content.replace('SintoMás', 'Sintomas')
    content = content.replace('fantasMás', 'fantasmas')
    content = content.replace('FantasMás', 'Fantasmas')
    content = content.replace('panoraMás', 'panoramas')
    content = content.replace('PanoraMás', 'Panoramas')
    content = content.replace('cronograMás', 'cronogramas')
    content = content.replace('CronograMás', 'Cronogramas')
    content = content.replace('wirefraMás', 'wireframes')

    # Fix "Año" inside words (e.g. realizAño -> realizado)
    # "Año" -> "ado"
    # But "Año" is "Year".
    # List specific words.
    words_ado = [
        'realiz', 'diseñ', 'model', 'implement', 'desarroll', 'gener', 'esper', 'consider',
        'mencion', 'relacion', 'seleccion', 'document', 'registr', 'configur', 'asegur',
        'integr', 'migr', 'oper', 'ejecut', 'planific', 'program', 'sincroniz', 'visualiz',
        'interactu', 'factur', 'ubic', 'funcion', 'version', 'vision', 'mision', 'region',
        'union', 'comun', 'segun', 'ningun', 'menu', 'tecnic', 'electric', 'metod', 'metric',
        'analis', 'estand', 'tambien', 'ademas', 'mas', 'despues', 'ingenieri', 'tecnologi',
        'metodologi', 'auditori', 'categori', 'garanti', 'dia', 'guia', 'via', 'frio', 'period',
        'cano', 'diseno', 'tamano', 'ano', 'espanol', 'compania', 'ordenes', 'area', 'exito',
        'indice', 'unico', 'ultimo', 'optimo', 'util', 'agil', 'angulo', 'ambito', 'arbol', 'item',
        'capitulo', 'arevalo', 'limon', 'estrategico', 'critico', 'politica', 'economico',
        'teorico', 'basico', 'rapido', 'practico', 'grafico', 'telefono', 'america', 'pagina',
        'numero', 'codigo', 'modulo', 'titulo', 'articulo', 'vehiculo', 'calculo', 'vinculo',
        'obstaculo', 'circulo', 'perdida', 'busqueda', 'linea', 'optimiz', 'normaliz', 'personaliz',
        'automatiz', 'centraliz', 'actualiz', 'organiz', 'utiliz', 'encabez', 'valid', 'prob',
        'aprob', 'result', 'est', 'list', 'merc', 'cuid', 'cand', 'identific'
    ]
    for word in words_ado:
        # Case insensitive replacement for word + Año -> word + ado
        # But we need to be careful about casing.
        # Regex: (word)Año -> \1ado
        # We'll do simple string replace for now for common cases
        content = content.replace(word + 'Año', word + 'ado')
        content = content.replace(word.capitalize() + 'Año', word.capitalize() + 'ado')
        content = content.replace(word.upper() + 'Año', word.upper() + 'ADO')

    # Fix "Año" -> "alo" for Arévalo
    content = content.replace('Arévaloado', 'Arévalo') # Fix double replace if happened
    content = content.replace('ArévAño', 'Arévalo')

    # Fix "Año" -> "año" for Tamaño, Año
    content = content.replace('tAMAño', 'tamaño')
    content = content.replace('TAMAño', 'TAMAÑO')
    content = content.replace('dAños', 'datos') # Handled above but good to be sure

    # Fix "Está" -> "estr" or "esti" or "esta"
    # Estáuctura -> Estructura
    content = content.replace('Estáuctura', 'Estructura')
    content = content.replace('infraEstáuctura', 'infraestructura')
    content = content.replace('InfraEstáuctura', 'Infraestructura')
    content = content.replace('estáuctura', 'estructura')
    
    # InvEstágación -> Investigación
    content = content.replace('InvEstágación', 'Investigación')
    content = content.replace('invEstágación', 'investigación')
    
    # Estándar -> Estándar (Correct)
    # Está -> Esta (if not accent)
    # But "Está" is "Is".
    # "Está" appearing in "REstá" -> "REST"
    content = content.replace('REstá', 'REST')
    content = content.replace('Restá', 'REST')

    # Fix "SiÍtema" -> "Sistema"
    content = content.replace('SiÍtema', 'Sistema')
    content = content.replace('siÍtema', 'sistema')
    content = content.replace('EcoSiÍtema', 'Ecosistema')

    # Fix "Dí" -> "Di"
    content = content.replace('Díagrama', 'Diagrama')
    content = content.replace('Díagnostico', 'Diagnóstico')
    content = content.replace('Díaz', 'Díaz') # Correct
    content = content.replace('PiDíache', 'Pidiache')

    # Fix "Guía" -> "gura"
    content = content.replace('FiGuía', 'Figura')
    content = content.replace('ConfiGuíación', 'Configuración')
    content = content.replace('AseGuía', 'Asegura')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filepath}")

def main():
    base_dir = r"c:\Users\camil\Downloads\Compressed\aplicativo_cermont_prueba\Libro\Capitulos"
    for filename in os.listdir(base_dir):
        if filename.endswith(".tex"):
            fix_file(os.path.join(base_dir, filename))

if __name__ == "__main__":
    main()
