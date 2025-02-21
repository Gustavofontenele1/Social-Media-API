const User = require("../models/User");
const cron = require("node-cron");

cron.schedule("0 * * * *", async () => {
  try {
    console.log("🔍 Executando limpeza de usuários não verificados...");

    const expiredUsers = await User.find({
      isVerified: false,
      verificationTokenExpiry: { $lt: new Date() }
    });

    if (expiredUsers.length > 0) {
      console.log(`🗑️ ${expiredUsers.length} usuários serão removidos.`);

      await User.deleteMany({
        isVerified: false,
        verificationTokenExpiry: { $lt: new Date() }
      });

      console.log("✅ Usuários removidos com sucesso!");
    } else {
      console.log("🗑️ Nenhum usuário a remover.");
    }
  } catch (error) {
    console.error("❌ Erro ao remover usuários não verificados:", error);
  }
});
