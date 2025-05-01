const express = require('express');
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
const router = require('./Routes/UserRoute');
const bcrouter = require('./Routes/BlockChain');
const GameGenerateApi = require('./Routes/GameRoute');
const client = require('./MongoDbConnection');
const itemrouter = require('./Routes/Itemroute')
const { initContract } = require('./controllers/BDChainController');

app.use(express.json());

app.use('/api/', router, bcrouter,GameGenerateApi,itemrouter);

// Khi server khởi động, gọi initContract 1 lần
app.listen(port, async () => {
    console.log(`🚀 Server chạy tại http://localhost:${port}`);
    try {
        await initContract();
    } catch (err) {
        console.error("❌ Lỗi khi khởi tạo contract:", err);
    }

    if (client != null) {
        console.log("✅ Kết nối MongoDB thành công!");
    } else {
        console.log("❌ Kết nối MongoDB thất bại!");
    }
});
