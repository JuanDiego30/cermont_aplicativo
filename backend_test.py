#!/usr/bin/env python3
"""
CERMONT Backend API Tests
Tests the FastAPI proxy and NestJS backend endpoints
"""

import requests
import sys
import json
from datetime import datetime

class CermontAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.ConnectError as e:
            print(f"❌ Failed - Connection Error: {str(e)}")
            return False, {}
        except requests.exceptions.Timeout as e:
            print(f"❌ Failed - Timeout: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )

    def test_login_valid(self, email, password):
        """Test login with valid credentials"""
        success, response = self.run_test(
            "Login (Valid Credentials)",
            "POST",
            "api/auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and isinstance(response, dict) and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        elif success and isinstance(response, dict) and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_login_invalid(self, email, password):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Login (Invalid Credentials)",
            "POST",
            "api/auth/login",
            401,
            data={"email": email, "password": password}
        )
        return success

    def test_protected_endpoint(self):
        """Test a protected endpoint that requires authentication"""
        if not self.token:
            print("⚠️  Skipping protected endpoint test - no token available")
            return False
            
        return self.run_test(
            "Protected Endpoint (Dashboard/Profile)",
            "GET",
            "api/auth/profile",
            200
        )[0]

    def test_ordenes_endpoint(self):
        """Test ordenes (work orders) endpoint"""
        if not self.token:
            print("⚠️  Skipping ordenes test - no token available")
            return False
            
        return self.run_test(
            "Ordenes List",
            "GET",
            "api/ordenes",
            200
        )[0]

def main():
    """Main test execution"""
    print("🚀 Starting CERMONT Backend API Tests")
    print("=" * 50)
    
    # Setup
    tester = CermontAPITester("http://localhost:8001")
    
    # Test credentials from the request
    valid_email = "tecnico1@cermont.com"
    valid_password = "tecnico123456"
    invalid_password = "wrongpassword"

    # Run tests in order
    print("\n📋 Test Plan:")
    print("1. Health Check")
    print("2. Login with valid credentials")
    print("3. Login with invalid credentials")
    print("4. Protected endpoint access")
    print("5. Ordenes endpoint access")
    
    # 1. Health Check
    health_ok = tester.test_health_check()[0]
    
    # 2. Valid Login
    login_ok = tester.test_login_valid(valid_email, valid_password)
    
    # 3. Invalid Login
    invalid_login_ok = tester.test_login_invalid(valid_email, invalid_password)
    
    # 4. Protected endpoint (only if login worked)
    protected_ok = False
    if login_ok:
        protected_ok = tester.test_protected_endpoint()
    
    # 5. Ordenes endpoint (only if login worked)
    ordenes_ok = False
    if login_ok:
        ordenes_ok = tester.test_ordenes_endpoint()

    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print("\n📋 Individual Results:")
    print(f"✅ Health Check: {'PASS' if health_ok else 'FAIL'}")
    print(f"✅ Valid Login: {'PASS' if login_ok else 'FAIL'}")
    print(f"✅ Invalid Login (401): {'PASS' if invalid_login_ok else 'FAIL'}")
    print(f"✅ Protected Endpoint: {'PASS' if protected_ok else 'FAIL'}")
    print(f"✅ Ordenes Endpoint: {'PASS' if ordenes_ok else 'FAIL'}")
    
    # Determine overall result
    critical_tests = [health_ok, login_ok, invalid_login_ok]
    if all(critical_tests):
        print("\n🎉 CRITICAL TESTS PASSED - Backend is functional!")
        return 0
    else:
        print("\n❌ CRITICAL TESTS FAILED - Backend has issues!")
        return 1

if __name__ == "__main__":
    sys.exit(main())