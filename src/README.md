*GENERAL INSTRUCTION*
The entry point of the project is the index.ts file. It uses the App class defined in the app.ts file, which merges every single subservice of the app.

The src has 3 other folders.
-Schemas, which is for zod definitions
-Services, which is sub-services, that are later merged into the app in app.ts file
-utils, which is basically tools like logger
-http, which is basically a http service. It is not in the services folder, cause it is easier to manage it when it is independent from them