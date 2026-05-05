let encryptionKey = context.config.encryption_key;

if (!encryptionKey || encryptionKey.trim() === "") {
    const chars = "0123456789abcdef";
    encryptionKey = "";
    for (let i = 0; i < 64; i++) {
        encryptionKey += chars[Math.floor(Math.random() * chars.length)];
    }
}

env.set(".env", "ENCRYPTION_KEY", encryptionKey);
console.log("Generated .env with ENCRYPTION_KEY");
