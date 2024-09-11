class DatabaseContext {
    static instance = null;

    /**
     * Return DatabaseContext global instance
     * @returns {DatabaseContext}
     */
    static getInstance() {
        if (DatabaseContext.instance)
            return DatabaseContext.instance;

        DatabaseContext.instance = new DatabaseContext();
        return DatabaseContext.instance;
    }

    constructor() {
        // TODO: Start database connection
    }
}