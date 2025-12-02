export class UserPreferences {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public tone: string,
        public signature: string,
        public autoImport: boolean,
        public autoAiSend: boolean,
    ) { }
}  