#!/bin/bash
# Test account activation workflow

API_BASE="http://localhost:8083"
TEST_EMAIL="test.activation@example.com"
TEST_MDP="TestPass123"

echo "📧 === TEST ACCOUNT ACTIVATION WORKFLOW ==="
echo

# 1. Create user via /invite-user
echo "1️⃣ Creating user..."
INVITE_RESPONSE=$(curl -s -X POST "$API_BASE/invite-user" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"nom\": \"TestActivation\",
    \"prenom\": \"User\",
    \"role\": \"medecin\"
  }")

echo "Response: $INVITE_RESPONSE"
CODE=$(echo $INVITE_RESPONSE | grep -o '"code":"[^"]*' | cut -d'"' -f4)
echo "✅ Generated code: $CODE"
echo

# 2. Verify code and activate
echo "2️⃣ Verifying code and setting password..."
VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE/verify-code" \
  -H "Content-Type: application/json" \
  -d "{
    \"contact\": \"$TEST_EMAIL\",
    \"code\": \"$CODE\",
    \"provisionalPassword\": \"$TEST_MDP\"
  }")

echo "Response: $VERIFY_RESPONSE"
echo

# 3. Check status
echo "3️⃣ Checking database status..."
node << 'NODEJS'
require('dotenv').config();
const db = require('./db/database');

(async () => {
  const user = await db.findUserByContact('test.activation@example.com');
  console.log('User state:');
  console.log(`  - email: ${user.email}`);
  console.log(`  - isConfirmed: ${user.isConfirmed} ${user.isConfirmed === 1 ? '✅' : '❌'}`);
  console.log(`  - hasPassword: ${!!user.password}`);
  console.log(`  - mustChangePassword: ${user.mustChangePassword}`);
  
  if (user.isConfirmed === 1) {
    console.log('\n✅ SUCCESS! Account activated!');
    process.exit(0);
  } else {
    console.log('\n❌ FAILED! Account not activated!');
    process.exit(1);
  }
})();
NODEJS

