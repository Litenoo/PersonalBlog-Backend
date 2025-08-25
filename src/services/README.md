# Services Folder

The services folder has each service declaration files inside. **Each of those exports a class**, that is already **initialized** inside each of the files to make access to it simpler, those initialized classes are mostly being imported inside the app.ts and merged into the final app.

- database.service.ts :
    This service is responsible for communication with the database.
    It is a lot simpler to manage the database when there is one gate responsible for that communication. All
    the methods used to communicate and manage with the database are being defined inside the class exported
    from this file.

- http.service.ts :
    This service is responsible for the management of all the routes.
    It merges every single router imported from /src/routes folder. It makes it simpler to manage all the routers via one entry point.
