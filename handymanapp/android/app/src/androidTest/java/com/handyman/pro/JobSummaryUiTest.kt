package com.handyman.pro

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import org.junit.Test
import org.junit.runner.RunWith
import org.hamcrest.Matchers.allOf
import org.hamcrest.Matchers.containsString
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView
import android.widget.Button
import android.widget.EditText

/**
 * Sample UI Test for Job Summary functionality
 * 
 * This test class demonstrates UI testing by launching an Activity
 * and verifying job cost display functionality.
 * 
 * Prerequisites:
 * - Add to build.gradle (app level):
 *   androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
 *   androidTestImplementation 'androidx.test.ext:junit:1.1.5'
 *   androidTestImplementation 'androidx.test:rules:1.5.0'
 *   androidTestImplementation 'androidx.test:runner:1.5.2'
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class JobSummaryUiTest {

    @Test
    fun testJobCostDisplayCalculation() {
        // Launch the JobSummaryActivity and test cost calculation
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Enter hourly rate
            onView(withId(R.id.edit_hourly_rate))
                .perform(clearText(), typeText("75.50"))
            
            // Enter hours worked
            onView(withId(R.id.edit_hours_worked))
                .perform(clearText(), typeText("8.5"))
            
            // Enter material cost
            onView(withId(R.id.edit_material_cost))
                .perform(clearText(), typeText("250.00"))
            
            // Enter tax rate
            onView(withId(R.id.edit_tax_rate))
                .perform(clearText(), typeText("0.08"))
            
            // Click calculate button
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify labor cost display
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText(containsString("$641.75")))) // 75.50 * 8.5
            
            // Verify total before tax
            onView(withId(R.id.text_total_before_tax))
                .check(matches(withText(containsString("$891.75")))) // 641.75 + 250.00
            
            // Verify total with tax
            onView(withId(R.id.text_total_with_tax))
                .check(matches(withText(containsString("$963.09")))) // 891.75 * 1.08
            
            // Verify hours worked display
            onView(withId(R.id.text_hours_worked))
                .check(matches(withText(containsString("8.5 hours"))))
                
        } finally {
            activityScenario.close()
        }
    }

    @Test
    fun testJobCostWithZeroValues() {
        // Test UI behavior with zero values
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Enter zero hourly rate
            onView(withId(R.id.edit_hourly_rate))
                .perform(clearText(), typeText("0"))
            
            // Enter hours worked
            onView(withId(R.id.edit_hours_worked))
                .perform(clearText(), typeText("8"))
            
            // Enter material cost
            onView(withId(R.id.edit_material_cost))
                .perform(clearText(), typeText("100"))
            
            // Click calculate button
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify labor cost is zero
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText(containsString("$0.00"))))
            
            // Verify total is only material cost
            onView(withId(R.id.text_total_before_tax))
                .check(matches(withText(containsString("$100.00"))))
                
        } finally {
            activityScenario.close()
        }
    }

    @Test
    fun testJobCostErrorHandling() {
        // Test UI error handling with invalid inputs
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Enter negative hourly rate
            onView(withId(R.id.edit_hourly_rate))
                .perform(clearText(), typeText("-50"))
            
            // Enter hours worked
            onView(withId(R.id.edit_hours_worked))
                .perform(clearText(), typeText("8"))
            
            // Enter material cost
            onView(withId(R.id.edit_material_cost))
                .perform(clearText(), typeText("100"))
            
            // Click calculate button
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify error message is displayed
            onView(withId(R.id.text_error_message))
                .check(matches(allOf(
                    isDisplayed(),
                    withText(containsString("Hourly rate must be positive"))
                )))
                
        } finally {
            activityScenario.close()
        }
    }

    @Test
    fun testJobCostClearFunctionality() {
        // Test clear button functionality
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Enter some values
            onView(withId(R.id.edit_hourly_rate))
                .perform(clearText(), typeText("60"))
            
            onView(withId(R.id.edit_hours_worked))
                .perform(clearText(), typeText("6"))
            
            // Click calculate to populate results
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify results are displayed
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText(containsString("$360.00"))))
            
            // Click clear button
            onView(withId(R.id.btn_clear))
                .perform(click())
            
            // Verify all fields are cleared
            onView(withId(R.id.edit_hourly_rate))
                .check(matches(withText("")))
            
            onView(withId(R.id.edit_hours_worked))
                .check(matches(withText("")))
            
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText("")))
                
        } finally {
            activityScenario.close()
        }
    }

    @Test
    fun testJobCostFormValidation() {
        // Test form validation before calculation
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Try to calculate without entering any values
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify validation message
            onView(withId(R.id.text_error_message))
                .check(matches(allOf(
                    isDisplayed(),
                    withText(containsString("Please fill in all required fields"))
                )))
            
            // Enter only hourly rate
            onView(withId(R.id.edit_hourly_rate))
                .perform(typeText("50"))
            
            // Try to calculate again
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Should still show validation error for missing hours
            onView(withId(R.id.text_error_message))
                .check(matches(isDisplayed()))
                
        } finally {
            activityScenario.close()
        }
    }

    @Test
    fun testJobCostDisplayFormatting() {
        // Test proper currency formatting in display
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Enter values that will result in decimal places
            onView(withId(R.id.edit_hourly_rate))
                .perform(clearText(), typeText("33.33"))
            
            onView(withId(R.id.edit_hours_worked))
                .perform(clearText(), typeText("3"))
            
            onView(withId(R.id.edit_material_cost))
                .perform(clearText(), typeText("0.01"))
            
            // Click calculate
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify proper currency formatting with 2 decimal places
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText(containsString("$99.99"))))
            
            onView(withId(R.id.text_total_before_tax))
                .check(matches(withText(containsString("$100.00"))))
                
        } finally {
            activityScenario.close()
        }
    }

    @Test
    fun testJobCostCalculationPersistence() {
        // Test that calculated values persist during activity lifecycle
        val activityScenario = ActivityScenario.launch(JobSummaryActivity::class.java)
        
        try {
            // Enter values and calculate
            onView(withId(R.id.edit_hourly_rate))
                .perform(clearText(), typeText("40"))
            
            onView(withId(R.id.edit_hours_worked))
                .perform(clearText(), typeText("10"))
            
            onView(withId(R.id.btn_calculate))
                .perform(click())
            
            // Verify calculation
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText(containsString("$400.00"))))
            
            // Simulate configuration change (rotation)
            activityScenario.recreate()
            
            // Values should still be there after recreation
            onView(withId(R.id.text_labor_cost))
                .check(matches(withText(containsString("$400.00"))))
                
        } finally {
            activityScenario.close()
        }
    }
}

/**
 * Sample Activity for Job Summary functionality
 * This is a minimal implementation for testing purposes
 */
class JobSummaryActivity : AppCompatActivity() {
    
    private lateinit var editHourlyRate: EditText
    private lateinit var editHoursWorked: EditText
    private lateinit var editMaterialCost: EditText
    private lateinit var editTaxRate: EditText
    private lateinit var textLaborCost: TextView
    private lateinit var textTotalBeforeTax: TextView
    private lateinit var textTotalWithTax: TextView
    private lateinit var textHoursWorked: TextView
    private lateinit var textErrorMessage: TextView
    private lateinit var btnCalculate: Button
    private lateinit var btnClear: Button
    
    private val jobCalculator = JobCalculator()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // For this test, we'll create a simple layout programmatically
        // In a real app, you would use setContentView(R.layout.activity_job_summary)
        initializeViews()
        setupClickListeners()
    }
    
    private fun initializeViews() {
        // This is a simplified version for testing
        // In reality, you would inflate from XML layout
        editHourlyRate = EditText(this).apply { id = R.id.edit_hourly_rate }
        editHoursWorked = EditText(this).apply { id = R.id.edit_hours_worked }
        editMaterialCost = EditText(this).apply { id = R.id.edit_material_cost }
        editTaxRate = EditText(this).apply { id = R.id.edit_tax_rate }
        textLaborCost = TextView(this).apply { id = R.id.text_labor_cost }
        textTotalBeforeTax = TextView(this).apply { id = R.id.text_total_before_tax }
        textTotalWithTax = TextView(this).apply { id = R.id.text_total_with_tax }
        textHoursWorked = TextView(this).apply { id = R.id.text_hours_worked }
        textErrorMessage = TextView(this).apply { id = R.id.text_error_message }
        btnCalculate = Button(this).apply { 
            id = R.id.btn_calculate 
            text = "Calculate"
        }
        btnClear = Button(this).apply { 
            id = R.id.btn_clear 
            text = "Clear"
        }
    }
    
    private fun setupClickListeners() {
        btnCalculate.setOnClickListener {
            calculateJobCost()
        }
        
        btnClear.setOnClickListener {
            clearAllFields()
        }
    }
    
    private fun calculateJobCost() {
        try {
            val hourlyRateText = editHourlyRate.text.toString()
            val hoursWorkedText = editHoursWorked.text.toString()
            val materialCostText = editMaterialCost.text.toString().ifEmpty { "0" }
            val taxRateText = editTaxRate.text.toString().ifEmpty { "0" }
            
            if (hourlyRateText.isEmpty() || hoursWorkedText.isEmpty()) {
                showError("Please fill in all required fields")
                return
            }
            
            val hourlyRate = hourlyRateText.toDouble()
            val hoursWorked = hoursWorkedText.toDouble()
            val materialCost = materialCostText.toDouble()
            val taxRate = taxRateText.toDouble()
            
            if (hourlyRate < 0) {
                showError("Hourly rate must be positive")
                return
            }
            
            val laborCost = hourlyRate * hoursWorked
            val totalBeforeTax = jobCalculator.calculateJobCost(hourlyRate, hoursWorked, materialCost)
            val totalWithTax = if (taxRate > 0) {
                jobCalculator.calculateJobCostWithTax(hourlyRate, hoursWorked, materialCost, taxRate)
            } else {
                totalBeforeTax
            }
            
            // Display results with proper formatting
            textLaborCost.text = String.format("$%.2f", laborCost)
            textTotalBeforeTax.text = String.format("$%.2f", totalBeforeTax)
            textTotalWithTax.text = String.format("$%.2f", totalWithTax)
            textHoursWorked.text = String.format("%.1f hours", hoursWorked)
            
            // Clear any previous error messages
            textErrorMessage.text = ""
            
        } catch (e: NumberFormatException) {
            showError("Please enter valid numbers")
        } catch (e: IllegalArgumentException) {
            showError(e.message ?: "Invalid input")
        }
    }
    
    private fun clearAllFields() {
        editHourlyRate.text.clear()
        editHoursWorked.text.clear()
        editMaterialCost.text.clear()
        editTaxRate.text.clear()
        textLaborCost.text = ""
        textTotalBeforeTax.text = ""
        textTotalWithTax.text = ""
        textHoursWorked.text = ""
        textErrorMessage.text = ""
    }
    
    private fun showError(message: String) {
        textErrorMessage.text = message
    }
}

/**
 * Resource IDs for testing
 * In a real app, these would be generated automatically from XML layouts
 */
object R {
    object id {
        const val edit_hourly_rate = 1001
        const val edit_hours_worked = 1002
        const val edit_material_cost = 1003
        const val edit_tax_rate = 1004
        const val text_labor_cost = 1005
        const val text_total_before_tax = 1006
        const val text_total_with_tax = 1007
        const val text_hours_worked = 1008
        const val text_error_message = 1009
        const val btn_calculate = 1010
        const val btn_clear = 1011
    }
}