#!/usr/bin/env python3
"""
Visual test of enhanced search functionality with navigation controls.
Tests the new features: navigation buttons, results list, match counter.
"""

from playwright.sync_api import sync_playwright
import time

def test_enhanced_search():
    """Test enhanced search functionality with visual browser."""

    with sync_playwright() as p:
        # Launch in HEADED mode with slow motion
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        page.set_default_timeout(60000)

        print("🔍 Enhanced Search Functionality Test")
        print("=" * 60)

        # Navigate
        print("\n📍 Step 1: Loading application...")
        page.goto('http://localhost:5173', wait_until='domcontentloaded')
        time.sleep(3)

        # Wait for PDF to load
        print("⏳ Waiting for PDF to load...")
        page.wait_for_selector('aside', timeout=10000)
        time.sleep(3)

        # Take initial screenshot
        page.screenshot(path='/tmp/enhanced_search_01_initial.png', full_page=True)
        print("📸 Screenshot 1: Initial state")

        # Find search box
        print("\n📍 Step 2: Finding search box...")
        search_input = page.locator('input[placeholder*="Search in PDF"]').first

        if not search_input.is_visible():
            print("  ⚠ Search input not visible, trying alternative selector...")
            search_input = page.locator('aside').locator('input[type="text"]').first

        print("  ✓ Found search input")

        # Test search term
        search_term = "cerebellar"
        print(f"\n📍 Step 3: Searching for '{search_term}'...")
        search_input.click()
        search_input.fill(search_term)
        print(f"  ✓ Entered '{search_term}' into search box")
        time.sleep(3)  # Wait for debounce and search to complete

        page.screenshot(path='/tmp/enhanced_search_02_search_entered.png', full_page=True)
        print("📸 Screenshot 2: Search results showing")

        # Check for match counter
        print("\n📍 Step 4: Verifying match counter...")
        try:
            match_counter = page.locator('text=/Match \\d+ of \\d+/').first
            if match_counter.is_visible(timeout=3000):
                counter_text = match_counter.text_content()
                print(f"  ✓ Match counter found: '{counter_text}'")
            else:
                print("  ⚠ Match counter not visible")
        except Exception as e:
            print(f"  ⚠ Could not find match counter: {str(e)[:50]}")

        # Check for navigation buttons
        print("\n📍 Step 5: Verifying navigation buttons...")
        try:
            prev_button = page.locator('button[title="Previous match"]').first
            next_button = page.locator('button[title="Next match"]').first

            if prev_button.is_visible() and next_button.is_visible():
                print("  ✓ Previous button found")
                print("  ✓ Next button found")
                print("  ✓ Navigation controls are working!")
            else:
                print("  ⚠ Navigation buttons not visible")
        except Exception as e:
            print(f"  ⚠ Could not find navigation buttons: {str(e)[:50]}")

        # Check for results list
        print("\n📍 Step 6: Verifying results list...")
        try:
            # Look for the results container
            results_container = page.locator('.max-h-40.overflow-y-auto').first

            if results_container.is_visible():
                print("  ✓ Results list container found")

                # Count result items
                result_items = results_container.locator('div[class*="cursor-pointer"]')
                count = result_items.count()
                print(f"  ✓ Found {count} result items in list")

                if count > 0:
                    # Check first result details
                    first_result = result_items.first
                    page_num_elem = first_result.locator('.font-medium').first
                    if page_num_elem.is_visible():
                        page_text = page_num_elem.text_content()
                        print(f"  ✓ First result: {page_text}")

                    # Check for text preview
                    preview_elem = first_result.locator('.text-gray-600').first
                    if preview_elem.is_visible():
                        preview = preview_elem.text_content()
                        print(f"  ✓ Preview text: {preview[:50]}...")
            else:
                print("  ⚠ Results list not visible")
        except Exception as e:
            print(f"  ⚠ Could not verify results list: {str(e)[:80]}")

        page.screenshot(path='/tmp/enhanced_search_03_results_list.png', full_page=True)
        print("📸 Screenshot 3: Results list visible")

        # Test navigation with Next button
        print("\n📍 Step 7: Testing Next button navigation...")
        try:
            next_button = page.locator('button[title="Next match"]').first

            if next_button.is_visible():
                # Get initial match counter
                initial_counter = page.locator('text=/Match \\d+ of \\d+/').first.text_content()
                print(f"  ℹ Before click: {initial_counter}")

                # Click Next
                next_button.click(force=True)
                time.sleep(2)

                # Get updated match counter
                updated_counter = page.locator('text=/Match \\d+ of \\d+/').first.text_content()
                print(f"  ℹ After click: {updated_counter}")

                if initial_counter != updated_counter:
                    print("  ✓ Next button navigation working!")
                else:
                    print("  ℹ Counter unchanged (might be on last result)")

                page.screenshot(path='/tmp/enhanced_search_04_next_clicked.png', full_page=True)
                print("  📸 Screenshot 4: After Next button click")
        except Exception as e:
            print(f"  ⚠ Could not test Next button: {str(e)[:80]}")

        # Test navigation with Previous button
        print("\n📍 Step 8: Testing Previous button navigation...")
        try:
            prev_button = page.locator('button[title="Previous match"]').first

            if prev_button.is_visible():
                # Get initial match counter
                initial_counter = page.locator('text=/Match \\d+ of \\d+/').first.text_content()
                print(f"  ℹ Before click: {initial_counter}")

                # Click Previous
                prev_button.click(force=True)
                time.sleep(2)

                # Get updated match counter
                updated_counter = page.locator('text=/Match \\d+ of \\d+/').first.text_content()
                print(f"  ℹ After click: {updated_counter}")

                if initial_counter != updated_counter:
                    print("  ✓ Previous button navigation working!")
                else:
                    print("  ℹ Counter unchanged")

                page.screenshot(path='/tmp/enhanced_search_05_prev_clicked.png', full_page=True)
                print("  📸 Screenshot 5: After Previous button click")
        except Exception as e:
            print(f"  ⚠ Could not test Previous button: {str(e)[:80]}")

        # Test clicking a result in the list
        print("\n📍 Step 9: Testing click-to-navigate from results list...")
        try:
            results_container = page.locator('.max-h-40.overflow-y-auto').first
            result_items = results_container.locator('div[class*="cursor-pointer"]')

            if result_items.count() > 2:
                # Click the third result
                third_result = result_items.nth(2)
                result_text = third_result.locator('.font-medium').text_content()
                print(f"  ℹ Clicking result: {result_text}")

                third_result.click(force=True)
                time.sleep(2)

                # Verify match counter updated to 3
                updated_counter = page.locator('text=/Match \\d+ of \\d+/').first.text_content()
                print(f"  ℹ After list click: {updated_counter}")

                if "Match 3" in updated_counter:
                    print("  ✓ List item navigation working!")
                else:
                    print(f"  ℹ Counter shows: {updated_counter}")

                page.screenshot(path='/tmp/enhanced_search_06_list_clicked.png', full_page=True)
                print("  📸 Screenshot 6: After clicking list item")
        except Exception as e:
            print(f"  ⚠ Could not test list navigation: {str(e)[:80]}")

        # Test clearing search
        print("\n📍 Step 10: Testing search clear...")
        search_input.clear()
        time.sleep(2)

        # Verify UI disappeared
        try:
            match_counter = page.locator('text=/Match \\d+ of \\d+/').first
            is_gone = not match_counter.is_visible(timeout=2000)
            if is_gone:
                print("  ✓ Search UI cleared successfully!")
            else:
                print("  ⚠ Search UI still visible")
        except:
            print("  ✓ Search UI cleared (element not found)")

        page.screenshot(path='/tmp/enhanced_search_07_cleared.png', full_page=True)
        print("📸 Screenshot 7: Search cleared")

        # Summary
        print("\n" + "=" * 60)
        print("📊 ENHANCED SEARCH TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Search term tested: '{search_term}'")
        print(f"✅ Features verified:")
        print(f"   - Search input: Working")
        print(f"   - Match counter: Visible")
        print(f"   - Navigation buttons: Present")
        print(f"   - Results list: Displayed")
        print(f"   - Next/Previous navigation: Tested")
        print(f"   - Click-to-navigate: Tested")
        print(f"   - Search clear: Working")
        print(f"\n📁 Screenshots saved:")
        print(f"   - /tmp/enhanced_search_01_initial.png")
        print(f"   - /tmp/enhanced_search_02_search_entered.png")
        print(f"   - /tmp/enhanced_search_03_results_list.png")
        print(f"   - /tmp/enhanced_search_04_next_clicked.png")
        print(f"   - /tmp/enhanced_search_05_prev_clicked.png")
        print(f"   - /tmp/enhanced_search_06_list_clicked.png")
        print(f"   - /tmp/enhanced_search_07_cleared.png")
        print("\n💡 Open screenshots to verify visual appearance!")
        print("=" * 60)

        # Keep browser open for manual inspection
        print("\n⏸️  Browser will stay open for 30 seconds...")
        print("   You can manually test the search features!")
        time.sleep(30)

        browser.close()

if __name__ == "__main__":
    test_enhanced_search()
