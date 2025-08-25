# routes folder

- public.router.ts :
    This is a router that is accessible for everyone. There is no guard for it. It also contains routes needed to login such as /public/login to receive JWT token to be able to access the dashboard.router.ts routes.

- dashboard.router.ts :
    This router is being guarded via JWT token. There is a guard inside the httpClient.service.ts that keeps it secure.

-router.guard.ts
    This file exports a guard that is used to protect the dashboard.router.ts routes.
