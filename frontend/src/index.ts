import * as signalR from "@microsoft/signalr";

class ChatClient {
    private connection: signalR.HubConnection;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.on("ReceiveMessage", this.receiveMessage);
        this.setupUI();
    }

    private async start(): Promise<void> {
        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.log(err);
            setTimeout(() => this.start(), 5000);
        }
    }

    private receiveMessage = (user: string, message: string): void => {
        const li = document.createElement("li");
        li.textContent = `${user}: ${message}`;
        const messagesList = document.getElementById("messagesList");
        messagesList?.appendChild(li);
    }

    private setupUI(): void {
        const sendButton = document.getElementById("sendButton");
        sendButton?.addEventListener("click", this.sendMessage);
    }

    private sendMessage = (event: Event): void => {
        event.preventDefault();
        const userInput = document.getElementById("userInput") as HTMLInputElement;
        const messageInput = document.getElementById("messageInput") as HTMLInputElement;
        
        const user = userInput.value;
        const message = messageInput.value;
        
        this.connection.invoke("SendMessage", user, message).catch(err => console.error(err));
        messageInput.value = '';
    }

    public async initialize(): Promise<void> {
        await this.start();
        this.connection.onclose(async () => {
            await this.start();
        });
    }
}

const chatClient = new ChatClient();
chatClient.initialize();
