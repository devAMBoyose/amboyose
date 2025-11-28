{
    "info": {
        "_postman_id": "bambanking-api-collection-2025",
            "name": "BamBanking API",
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Signup",
            "request": {
                "method": "POST",
                "header": [{ "key": "Content-Type", "value": "application/x-www-form-urlencoded" }],
                "body": {
                    "mode": "urlencoded",
                    "urlencoded": [
                        { "key": "fullName", "value": "Anna Marice Eben Boyose" },
                        { "key": "email", "value": "anna@example.com" },
                        { "key": "pin", "value": "1234" }
                    ]
                },
                "url": {
                    "raw": "{{base_url}}/bambanking/signup",
                    "host": ["{{base_url}}"],
                    "path": ["bambanking", "signup"]
                }
            }
        },
        {
            "name": "Login",
            "request": {
                "method": "POST",
                "header": [{ "key": "Content-Type", "value": "application/x-www-form-urlencoded" }],
                "body": {
                    "mode": "urlencoded",
                    "urlencoded": [
                        { "key": "username", "value": "anna" },
                        { "key": "pin", "value": "1234" }
                    ]
                },
                "url": {
                    "raw": "{{base_url}}/bambanking/login",
                    "host": ["{{base_url}}"],
                    "path": ["bambanking", "login"]
                }
            }
        },
        {
            "name": "Check Balance (API)",
            "request": {
                "method": "GET",
                "url": {
                    "raw": "{{base_url}}/api/demo-balance",
                    "host": ["{{base_url}}"],
                    "path": ["api", "demo-balance"]
                }
            }
        },
        {
            "name": "Last Transaction (API)",
            "request": {
                "method": "GET",
                "url": {
                    "raw": "{{base_url}}/api/demo-last-tx",
                    "host": ["{{base_url}}"],
                    "path": ["api", "demo-last-tx"]
                }
            }
        },
        {
            "name": "Deposit",
            "request": {
                "method": "POST",
                "header": [{ "key": "Content-Type", "value": "application/x-www-form-urlencoded" }],
                "body": {
                    "mode": "urlencoded",
                    "urlencoded": [
                        { "key": "amount", "value": "500" }
                    ]
                },
                "url": {
                    "raw": "{{base_url}}/bambanking/deposit",
                    "host": ["{{base_url}}"],
                    "path": ["bambanking", "deposit"]
                }
            }
        },
        {
            "name": "Withdraw",
            "request": {
                "method": "POST",
                "header": [{ "key": "Content-Type", "value": "application/x-www-form-urlencoded" }],
                "body": {
                    "mode": "urlencoded",
                    "urlencoded": [
                        { "key": "amount", "value": "200" }
                    ]
                },
                "url": {
                    "raw": "{{base_url}}/bambanking/withdraw",
                    "host": ["{{base_url}}"],
                    "path": ["bambanking", "withdraw"]
                }
            }
        },
        {
            "name": "Transfer",
            "request": {
                "method": "POST",
                "header": [{ "key": "Content-Type", "value": "application/x-www-form-urlencoded" }],
                "body": {
                    "mode": "urlencoded",
                    "urlencoded": [
                        { "key": "toUser", "value": "bamby" },
                        { "key": "amount", "value": "150" }
                    ]
                },
                "url": {
                    "raw": "{{base_url}}/bambanking/transfer",
                    "host": ["{{base_url}}"],
                    "path": ["bambanking", "transfer"]
                }
            }
        }
    ],
        "variable": [
            {
                "key": "base_url",
                "value": "https://bankingapp-portfolio.onrender.com"
            }
        ]
}
