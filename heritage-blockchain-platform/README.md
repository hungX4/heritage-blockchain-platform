# Heritage Blockchain Platform

Prototype nghiên cứu cho đề tài: **Nghiên cứu ứng dụng công nghệ Blockchain trong xây dựng hệ thống định danh và quản lý tài sản số cho di sản văn hóa phi vật thể**.

Phase 1 tập trung khởi tạo nền móng kỹ thuật: monorepo, frontend, backend, MySQL connection, Hardhat, smart contract skeleton, storage abstraction, RBAC foundation, hash strategy và tài liệu kiến trúc. Phase này chưa triển khai đầy đủ nghiệp vụ.

## Mục tiêu prototype

- Quản lý hồ sơ di sản văn hóa phi vật thể theo hướng có nguồn gốc dữ liệu rõ ràng.
- Chuẩn bị quy trình submit, review, verify.
- Chuẩn bị định danh số, versioning và hash SHA-256.
- Ghi nhận bằng chứng bất biến lên Blockchain.
- Cho phép đối chiếu Database với Blockchain trong các phase sau.

## Kiến trúc hệ thống

```text
Frontend React + TypeScript
        |
      REST API
        |
Backend Node.js + Express + Sequelize
   |             |
 MySQL       Ethereum Smart Contract
   |
File Storage Reference
```

## Hybrid Storage

Blockchain không thay thế Database.

Database lưu metadata, hồ sơ, trạng thái, version, thông tin xác thực, file reference và blockchain transaction information. File Storage lưu ảnh, video, PDF, audio, tài liệu nguồn và hiện vật số. Blockchain chỉ lưu bằng chứng xác thực/tính toàn vẹn và lịch sử dữ liệu, tối thiểu gồm `heritageId`, `dataHash`, `version`, `verifier`, `timestamp`.

Blockchain được sử dụng để ghi nhận bằng chứng xác thực/tính toàn vẹn và lịch sử của dữ liệu.

## Role / Permission

Hệ thống chuẩn bị RBAC qua `User.role`:

- `ADMIN`: quản lý hệ thống và người dùng.
- `DATA_PROVIDER`: tạo/cung cấp hồ sơ di sản.
- `REVIEWER`: kiểm tra và xác thực hồ sơ.
- `USER`: tra cứu dữ liệu đã công khai.

## Hash Strategy

Backend sử dụng SHA-256 thông qua `HashService`. Dữ liệu được canonicalize trước khi hash để cùng một dữ liệu logic tạo cùng một `dataHash`. Phase 1 chuẩn bị các trường mẫu: `heritageCode`, `name`, `description`, `source`, `version`.

Nếu smart contract dùng `bytes32`, backend có thể chuyển SHA-256 hex sang `0x...` bytes32 mà không đổi thuật toán sang Keccak-256.

## Công nghệ

- Frontend: React, TypeScript, Vite, React Router, Axios, Tailwind CSS, Lucide React.
- Backend: Node.js, Express, TypeScript, Sequelize, MySQL, JWT, bcrypt, dotenv, cors, cookie-parser.
- Blockchain: Solidity, Hardhat, ethers.js, Ethereum Sepolia cho deployment sau này.
- Development: Git, ESLint, Prettier.

## Cấu trúc thư mục

```text
heritage-blockchain-platform/
├── frontend/
├── backend/
├── blockchain/
├── storage/
├── docs/
├── .gitignore
├── .editorconfig
├── package.json
└── README.md
```

## Yêu cầu môi trường

- Node.js 20+.
- npm 10+.
- MySQL 8+ nếu chạy backend với database thật.
- RPC Sepolia và private key chỉ cần ở phase deployment/testnet.

## Cài đặt

```bash
npm install
```

## Environment variables

Sao chép các file `.env.example`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp blockchain/.env.example blockchain/.env
```

Không commit `.env` hoặc private key.

Cập nhật `.env` với `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_USER_PASSWORD`.(theo env.example)

## Database setup

Chạy docker để khởi tạo database rỗng:
```bash
docker-compose up -d
```

Chạy migration để tạo các bảng:
```bash
npm run migration:run
```



## Chạy frontend

```bash
npm run dev:frontend
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Chạy backend

```bash
npm run dev:backend
```

Backend mặc định chạy tại `http://localhost:3000`.

Health check:

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "success": true,
  "message": "Heritage Blockchain API is running"
}
```

## Compile/test blockchain

```bash
npm --workspace blockchain run compile
npm --workspace blockchain run test
```

## Roadmap

- Phase 2 - Database & Authentication.
- Phase 3 - Heritage Management.
- Phase 4 - Verification Workflow.
- Phase 5 - Hash & Versioning.
- Phase 6 - Smart Contract.
- Phase 7 - Blockchain Integration.
- Phase 8 - Integrity Verification.
- Phase 9 - Experimental Evaluation.
- Phase 10 - Future Extensions.

## Giới hạn Phase 1
Phase 1 không triển khai NFT marketplace, cryptocurrency/token, payment, Ethereum Mainnet, bán vé thật, giao dịch tài sản thật, IPFS production integration, toàn bộ Heritage CRUD, toàn bộ authentication hoặc toàn bộ verification workflow.

##erd diagram
<img width="1412" height="849" alt="image" src="https://github.com/user-attachments/assets/eb4f4f17-c97b-4ff3-a6e8-cc84ffe4d220" />

