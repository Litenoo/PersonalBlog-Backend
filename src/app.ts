export default class App {
    constructor(port: number) {
        this.listen(port);
    }

    listen = (port: number): void => {
        console.log(`Server is listening on port ${port}`);
    }
}