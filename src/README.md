*GENERAL INSTRUCTION*
The entry point of the project is the index.ts file. It uses the App class defined in the app.ts file, which merges every single subservice of the app.

The src has 3 other folders.
-Schemas, which is for zod definitions
-Services, which is sub-services, that are later merged into the app in app.ts file
-utils, which is basically tools like logger
-http, which is basically a http service. It is not in the services folder, cause it is easier to manage it when it is independent from them

IMPORTANT INFO : Every single file that has .service.ts extension has a pre-constructed object of class that it is defines. It makes it able to use a single service instead of initialising a couple of them.

-schemas/post.schema.ts
    This file is meant to contain type assertions to make it easier to manage the data related to the post model

-routes/dashboard.ts 
    This file is meant to contain routes that are going to be protected by the JWT token authentication

- tokenAuthentication.ts
    This file is meant to contain the functions responsible for JWT authentication and management. It is not an independent service because it would be too small to do so.

- 