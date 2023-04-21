export default class ValidationError extends Error {
    constructor(message, errors) {
        super(message);
        if (typeof message === 'object') {
            this.errors = message;
            this.message = 'Invalid input';
        } else {
            this.message = message;
            this.errors = errors;
        }
    }
    
};

