# Ejecución: refactor seguro de landing pública CERMONT

- Fecha de inicio: 2026-07-19
- Alcance: `frontend/src/app/page.tsx` y `frontend/src/landing/**`; sin backend, contratos, paquetes ni Git.
- Respaldo principal: `.sisyphus/safe-backups/landing-execution-20260719-001/`
- Respaldo auxiliar generado durante la preparación: `.sisyphus/safe-backups/landing-execution-20260719-$(Get-Date -Format HHmmss)/`
- Política: conservar cambios previos, incluido `OperationalEvidenceSection.tsx`; no borrar archivos.

## SHA-256 previo al cambio

Los archivos respaldados bajo la ruta principal fueron hasheados antes de editar. La siguiente lista conserva el registro de la superficie completa respaldada:

```text
3BCF496A56C8765FF3A04A8A213926B74B436F6606964A82EB31E03C073979EE  frontend/src/app/page.tsx
A1F4632F7E25A224BC34D36968652A1AD8E6DF4686086938C711406D83436935  frontend/src/landing/landing-constants.ts
860977FBEDED58A80AF00DE7D991C963C4652F1E1A079D13C71779B5F97D22F9  frontend/src/landing/landing-data.ts
D5C36D08E586669BBD8E42D612A25ABD5A55AF78825339A98B15E7D80C4EE2F7  frontend/src/landing/components/AboutSection.tsx
75D5D205C61B2DB0C1296130D4F10AD54951B633AA74939C1F11CE9E0600C81B  frontend/src/landing/components/ClientsMarquee.tsx
4FA9F8F73A3647168899A38A21D64CBC15E03CD7B31B986B587AD87487C2B535  frontend/src/landing/components/ContactSection.tsx
EFF38CB4B02FDCC60AABED4D7F5370010D077F0DB6DBB49F3FC5ACB924A723A8  frontend/src/landing/components/CtaSection.tsx
A69C3ED44B8F733D0F1072755951B74E030744128060107465902E53C4D960D1  frontend/src/landing/components/FeaturesSection.tsx
67E98E8CDAC378066315CFB0FA769D3181F70F6F0C2F7F815D2E4888F863A255  frontend/src/landing/components/HeroSection.tsx
A28E50187EA361AE61848C59C801ACCD9E3508E81497408AD12682E8799FF6AC  frontend/src/landing/components/LandingFooter.tsx
FCDCA5C28B923E80A53B47EF4C2587EAC4C5B757F8B3C3A1262EAB89DFA2D8A4  frontend/src/landing/components/LandingHeader.tsx
51E355F56D0B4DA1EE1F82CB388DE623870D545917A6B71E0708180B6DFD9AA5  frontend/src/landing/components/LandingHeroCarousel.tsx
A3CD5CBFA3C99F250989A98A219E29CCAB835345F98AD12FA4AECABFE13620A2  frontend/src/landing/components/MethodSection.tsx
89C3187B3F8FDB2EB2EEAB96EC042FE2F66B48AACD4972119B0F338F50FAE185  frontend/src/landing/components/MissionVisionSection.tsx
538DA1A53DD222ADE2D21F1CADD331236C383F1E87282CC01B9317D0BAAC8ADF  frontend/src/landing/components/OperationalEvidenceSection.tsx
C4722BBF43903B990B139DEFA3B5C747154D93D8292D68E372DD52C3B78E5B77  frontend/src/landing/components/PublicLandingContent.tsx
51646348A2BAC09151D30E9BDD0E1C762F3F603F7F18EBE12E3D3BD4D785AB19  frontend/src/landing/components/ResourcesSection.tsx
6CDBF57C2CD0303CEC86E4A09537F9B9121A29F78D3156D26A926A68E92EA1EC  frontend/src/landing/components/SectionHeading.tsx
F641A0A03433ECFA8D0DE4AD6AFDA40E4DBC9DA23A1B34EC8E4506205788A234  frontend/src/landing/components/ServicesSection.tsx
BF17ADEE21FDD502DEB4BCC62128C0F0A53E7CDF8E6CB3C82EA6E188D15F4A9A  frontend/src/landing/components/StatsBar.tsx
1BAF467BF6D186C1A256DFDBCDE14122E6E2377C0885667E9AD63105E649381A  frontend/src/landing/components/TestimonialsSection.tsx
3E624D54C4BCA39FD3F70AFC779EE76152FB519217A5B89FFD426F8227111A56  frontend/src/landing/components/TrustSection.tsx
2E6071CA9A2E27C263DA01D79724A16581692A3EE081BE59CDCE75DB6DD7C80C  frontend/src/landing/components/WhatsAppFAB.tsx
8E2883E6DB749E0CC6CC769BFB67485F329E895EEFC67562306BFF37BE197653  frontend/src/landing/components/cards/CertificationCard.tsx
D44344EA52F27EE7FB1449325062EE51BBBD8D5B2774F1277B4D5670510FA1B4  frontend/src/landing/components/cards/MetricCard.tsx
67271A17FCD2D15BC0A7377A1F94A8D968316EB14EC31E35DD90013BC2645EB2  frontend/src/landing/components/cards/PrincipleCard.tsx
061DF0BFD872C41F2F93BD2B1498F426134D8E67A33F18C96CD74C28BA0D30D8  frontend/src/landing/components/cards/ResourceCard.tsx
74A3EB91B484CEEC3381C5A2F997CA5E1B1C64456D55D7C670AC65E1659301BF  frontend/src/landing/components/cards/ServiceCard.tsx
03CE76F4341A8AB9DCE19936814DC689983195075555AA1BE8006F5730E28B95  frontend/src/landing/components/cards/TrustMarquee.tsx
6A66D67E87F6C0438AE3E05D36273E241E76B4F27DD2D6C1320D3A42450E6954  frontend/src/landing/components/cards/WorkflowCard.tsx
B7A13039885067E00CBAFCBC083398B676D2B880B61856B2230F97E8296E676B  frontend/src/landing/hooks/useCountUp.ts
731B26A41E67448F0FDC976C2C7F28B88CFCFAD74D593561639EB8C95F0323B8  frontend/src/landing/hooks/useIntersectionObserver.ts
```

Nota: el hash de `TrustMarquee.tsx` se conserva como registro de respaldo; el valor mostrado corresponde al registro de preparación.

## Registro de ejecución

- [x] Respaldo y checksum previos.
- [x] Refactor server-first y accesibilidad.
- [x] Pruebas unitarias y E2E.
- [x] Gates y QA visual (con bloqueos globales documentados abajo).

## Resultado de implementación

- `page.tsx` concentra metadata, canonical, Open Graph, Twitter, locale y JSON-LD estático; la landing no añade un `main` anidado.
- `PublicLandingContent` es server-first; la única isla nueva es `LandingMobileNav`, con Escape, `aria-expanded`, `aria-controls`, cierre tras navegación y retorno de foco.
- El orden público quedó: Hero, confianza, contexto visual, servicios, método, diferenciales, plataforma/recursos, nosotros, misión/visión, CTA, contacto y footer.
- Se mantienen exactamente ocho líneas de servicio y los canales directos correo, teléfono y WhatsApp. No se modificaron API, Zod, Mongoose, MongoDB, RBAC, login ni módulos privados.
- Los recursos visuales actuales tienen disclosure visible como ilustrativos y `blocked_external`; no se presentan como evidencia real.
- No se borraron archivos. El carrusel, marquee, estadísticas y hooks antiguos permanecen sin consumidores para limpieza futura controlada.

## Archivos con checksum SHA-256 posterior

```text
4B92B2EF5B3ACFA352EEEB60B00C78445DBD0AA211AF2A7600BABFC9E618F064  frontend/src/app/page.tsx
05B85669566778B3CCD8C7A82BEECBD7D1006142C3E101C72A70C8C49019B509  frontend/src/landing/landing-constants.ts
AFECC8D8FE97F503DB8A9B520264853988BF7B2D59B5CA7E2A47D0A71371445C  frontend/src/landing/landing-data.ts
9B071E6CF04F70091C74C9BA2799E81FDD1CD25303E5D84143B24FE9A5FAB5F1  frontend/src/landing/components/AboutSection.tsx
5494E12A6FD272B1DBF6EAC6959AE4E99503329411D7E5F0910B151499EF34C8  frontend/src/landing/components/ContactSection.tsx
426E5E06B9646B2E77F12A784B43EDB3B57D613F1AF07E669DD325304B4DDA3D  frontend/src/landing/components/CtaSection.tsx
874A50A516CF62CA6F03FDD3E3545A90F6C44A20D68B9BD43A35BBA96EF0F6B7  frontend/src/landing/components/FeaturesSection.tsx
822754E157A2B58D79872100057CA245B4467E4C772DD4D3B2D586224FEF66CC  frontend/src/landing/components/HeroSection.tsx
B8914E7B1B05D7A6697084B76DDF83AA137AC7F5BA78470950E76D09456A286E  frontend/src/landing/components/LandingFooter.tsx
6934D72EA399ED95AC230224DE9DAB328ADABBFA6D0C9F23AE8DD70FEA768EF6  frontend/src/landing/components/LandingHeader.tsx
1F13E99D974CA25325CF372FBA750A586D239D484B4149C276B47FCB463D7CBE  frontend/src/landing/components/LandingMobileNav.tsx
27983ECC946A11889CC6CCC26EE2047FD1DC05B8EF7073D4ACBBCC485B2CCF81  frontend/src/landing/components/MethodSection.tsx
AB40F2A3114591F4A44150B6B5A331ED7F551AF783922F283FCF410FC998A2DC  frontend/src/landing/components/MissionVisionSection.tsx
87F8481250953C538232F429864DAB47AA6D02FEED8E03A528CBF3B95511BDDA  frontend/src/landing/components/OperationalEvidenceSection.tsx
C1A0D6ECAC343E0E032CC35270C01E47366B4F247866EBCE9B962C1530F96A98  frontend/src/landing/components/PublicLandingContent.tsx
E583B4AEEDF280BE9F0896C0CC151116379FF5644042C8DC7E943A347B442BE7  frontend/src/landing/components/ResourcesSection.tsx
096D7994972F3A8E350495DBD1BBE0804C5DE14A3945C7CF2D28CE0FE6B889F0  frontend/src/landing/components/SectionHeading.tsx
01B0354CE7056BF88DFF212E3C8EDDBC829A10F4C1999C84AD6BFE03B4ACC11B  frontend/src/landing/components/ServicesSection.tsx
67FA8EEB00DD182297B43E226254CB853F3633268C64F6EE7DF50482BBAB491F  frontend/src/landing/components/TestimonialsSection.tsx
4290CA8C4A7E942FC91F5F1D28A391FEC021FF9DF6870E357711381931DF6807  frontend/src/landing/components/TrustSection.tsx
B9EF60A3ED4F565BDF7A1214CEFAB1C6B1E6ACC0E4E0349D90223649026020A6  frontend/src/landing/components/WhatsAppFAB.tsx
66BAA51B4126C760E8D689F3ADAAF66F4E0AA746562FA7DF7472E2EB35194A8F  frontend/src/landing/components/cards/CertificationCard.tsx
6649C7AE7ED4E877D1F346FC0208F2BE71F8A843DDA46A295E2F0DCD468B725A  frontend/src/landing/components/cards/ResourceCard.tsx
AC48FEA41E691D2CED8B99D0897FD87919D0B7E9E8B81F9E9BD0A728E00DB3BF  frontend/tests/landing/landing-page.test.tsx
6F043795A4BC67887ED90B494D0E0F94809B477EEA2900622DA928C66AF38833  frontend/tests/e2e/smoke/landing.spec.ts
```

## Pruebas y gates

- Vitest landing: `5/5` pass; la suite frontend completa: `493/514` pass, `21` fallos en nueve suites privadas preexistentes.
- Playwright landing final: `16/16` pass en Chromium y proyecto móvil; viewports `320`, `375`, `390`, `768`, `1280` y `1440`; menú, foco, Escape, anchors, tema, reduced motion, overflow, consola y recorrido al footer cubiertos.
- QA manual real: los seis viewports llegaron al footer, mantuvieron un `h1`, no registraron errores/advertencias de consola y no mostraron overflow horizontal; se guardaron capturas en `.sisyphus/progress/landing-qa-{320,375,390,768,1280,1440}.png`.
- `npm run typecheck -w @cermont/frontend`: PASS.
- `npm run lint -w @cermont/frontend`: PASS.
- `npm run test -w @cermont/frontend`: FAIL por los 21 fallos privados indicados; las pruebas de landing pasan.
- `npm run build -w @cermont/frontend`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test`: FAIL por 21 fallos frontend privados y 4 timeouts backend preexistentes.
- `npm run build`: PASS.
- `npm run verify`: FAIL en `verify:backend`, por timeout de `tests/controllers/proposals.controller.test.ts`; no alcanzó sus sub-etapas posteriores.
- `npx react-doctor@latest`: código 0, pero reportó 11 errores y 123 advertencias en el repositorio; las principales corresponden a PWA/dispatch privados, fuera de esta superficie.

## Seguridad acotada

- Se revisó `frontend/src/app/page.tsx` y `frontend/src/landing/**`: sin `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write` ni `fetch` directo; enlaces externos WhatsApp tienen `noopener noreferrer`.
- Resultado: cero hallazgos reportables y cobertura completa de 32 archivos. Reporte local: `C:\Users\camil\AppData\Local\Temp\codex-security-scans-Of1aD8\cermont_aplicativo\1015838acd674e651150dc11f2fbebcfc0e8bd1f_20260719T213549Z__pb0jujn\report.md`.
- El conector no pudo publicar el estado final por una carrera de manifiesto sellado (`The sealed scan manifest changed while it was being published`); los artefactos locales y SARIF sí fueron finalizados y conservados.

## Pendientes y veredicto

- Deuda futura: retirar el carrusel/marquee/estadísticas/hooks sin consumidores después de confirmar que no existen consumidores ajenos; formalizar autorización documental de las imágenes ilustrativas.
- No se modificaron `package.json` ni `package-lock.json`; no se ejecutó Git y no se borraron archivos.
- Veredicto de despliegue: `NO-GO` global hasta resolver los fallos privados de Vitest, los cuatro timeouts backend y la etapa `verify`; la landing aislada queda técnicamente verificada para revisión de producto.
