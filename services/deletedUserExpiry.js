const User = require("../models/User");
const cron = require("node-cron");

cron.schedule("0 * * * *", async () => {
  try {
    console.log("🔍 Executando limpeza de usuários não verificados...");

    const allUsers = await User.find({});
    
    console.log("Usuários encontrados e seus verificationTokenExpiry:");
    allUsers.forEach(user => {
      console.log(`ID: ${user._id}, Email: ${user.email}, verificationTokenExpiry: ${user.verificationTokenExpiry}`);
    });

    const expiredUsers = await User.find({
      isVerified: false,
      verificationTokenExpiry: { $lt: new Date() },
      verificationTokenExpiry: { $ne: null }
    });

    console.log("Usuários expirados encontrados:", expiredUsers);

    if (expiredUsers.length > 0) {
      console.log(`🗑️ ${expiredUsers.length} usuários serão removidos.`);

      await User.deleteMany({
        isVerified: false,
        verificationTokenExpiry: { $lt: new Date() },
        verificationTokenExpiry: { $ne: null }
      });

      console.log("✅ Usuários removidos com sucesso!");
    } else {
      console.log("🗑️ Nenhum usuário a remover.");
    }
  } catch (error) {
    console.error("❌ Erro ao remover usuários não verificados:", error);
  }
});
