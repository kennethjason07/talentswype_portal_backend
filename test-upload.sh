#!/bin/bash

# Google Cloud Storage Resume Upload - Quick Test Script
# This script tests the resume upload endpoint

echo "🧪 Testing Google Cloud Storage Resume Upload"
echo "=============================================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:8020/api/v1}"
TEST_FILE="${TEST_FILE:-test-resume.pdf}"
JWT_TOKEN="${JWT_TOKEN}"

# Check if JWT token is provided
if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Error: JWT_TOKEN environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  export JWT_TOKEN='your-jwt-token-here'"
    echo "  ./test-upload.sh"
    echo ""
    echo "Or:"
    echo "  JWT_TOKEN='your-jwt-token' ./test-upload.sh"
    exit 1
fi

# Check if test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo "⚠️  Test file not found: $TEST_FILE"
    echo "Creating a dummy PDF file for testing..."
    echo "%PDF-1.4" > "$TEST_FILE"
    echo "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj" >> "$TEST_FILE"
    echo "2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj" >> "$TEST_FILE"
    echo "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj" >> "$TEST_FILE"
    echo "xref 0 4" >> "$TEST_FILE"
    echo "trailer<</Size 4/Root 1 0 R>>" >> "$TEST_FILE"
    echo "startxref 149" >> "$TEST_FILE"
    echo "%%EOF" >> "$TEST_FILE"
    echo "✅ Created dummy test file: $TEST_FILE"
    echo ""
fi

echo "📤 Uploading resume to: $API_URL/upload/resume"
echo "📄 File: $TEST_FILE"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/upload/resume" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "resume=@$TEST_FILE")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_CODE"
echo ""

# Check result
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Upload successful!"
    
    # Extract URL from response
    RESUME_URL=$(echo "$BODY" | jq -r '.data.url' 2>/dev/null)
    
    if [ -n "$RESUME_URL" ] && [ "$RESUME_URL" != "null" ]; then
        echo "📎 Resume URL: $RESUME_URL"
        echo ""
        echo "🔍 Testing if file is accessible..."
        
        # Test if URL is accessible
        URL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$RESUME_URL")
        
        if [ "$URL_STATUS" = "200" ]; then
            echo "✅ File is publicly accessible!"
        else
            echo "⚠️  File returned status: $URL_STATUS"
        fi
    fi
else
    echo "❌ Upload failed!"
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo "💡 Hint: Check if your JWT token is valid"
    elif [ "$HTTP_CODE" = "400" ]; then
        echo "💡 Hint: Check file format (PDF, DOC, DOCX only)"
    elif [ "$HTTP_CODE" = "500" ]; then
        echo "💡 Hint: Check backend logs for errors"
        echo "   Run: pm2 logs backendslanster"
    fi
fi

echo ""
echo "=============================================="
