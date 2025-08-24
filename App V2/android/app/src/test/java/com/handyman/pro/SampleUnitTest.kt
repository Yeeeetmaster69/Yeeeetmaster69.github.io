package com.handyman.pro

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before
import org.junit.After
import org.mockito.Mockito.*
import java.util.*

/**
 * Sample Unit Test for Handyman Pro
 * 
 * This class demonstrates various types of unit tests that can be written
 * for a mobile application, including business logic testing, utility testing,
 * and mock testing patterns.
 * 
 * Prerequisites:
 * - Add to build.gradle (app level):
 *   testImplementation 'junit:junit:4.13.2'
 *   testImplementation 'org.mockito:mockito-core:4.6.1'
 *   testImplementation 'org.mockito:mockito-inline:4.6.1'
 */
class SampleUnitTest {

    private lateinit var jobCalculator: JobCalculator
    private lateinit var timeTracker: TimeTracker

    @Before
    fun setUp() {
        jobCalculator = JobCalculator()
        timeTracker = TimeTracker()
    }

    @After
    fun tearDown() {
        // Clean up any resources if needed
    }

    @Test
    fun testBasicAddition() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun testJobCostCalculation() {
        // Test business logic for calculating job costs
        val hourlyRate = 50.0
        val hoursWorked = 8.0
        val materialCost = 200.0
        
        val totalCost = jobCalculator.calculateJobCost(hourlyRate, hoursWorked, materialCost)
        
        assertEquals(600.0, totalCost, 0.01) // 50 * 8 + 200 = 600
    }

    @Test
    fun testJobCostCalculationWithTax() {
        val hourlyRate = 50.0
        val hoursWorked = 8.0
        val materialCost = 200.0
        val taxRate = 0.08 // 8% tax
        
        val totalCost = jobCalculator.calculateJobCostWithTax(hourlyRate, hoursWorked, materialCost, taxRate)
        
        // (50 * 8 + 200) * 1.08 = 648
        assertEquals(648.0, totalCost, 0.01)
    }

    @Test
    fun testTimeTrackingCalculation() {
        val startTime = Calendar.getInstance()
        startTime.set(2024, 0, 1, 9, 0) // 9:00 AM
        
        val endTime = Calendar.getInstance()
        endTime.set(2024, 0, 1, 17, 30) // 5:30 PM
        
        val hoursWorked = timeTracker.calculateHoursWorked(startTime.time, endTime.time)
        
        assertEquals(8.5, hoursWorked, 0.01) // 8.5 hours
    }

    @Test
    fun testTimeTrackingWithBreaks() {
        val startTime = Calendar.getInstance()
        startTime.set(2024, 0, 1, 9, 0) // 9:00 AM
        
        val endTime = Calendar.getInstance()
        endTime.set(2024, 0, 1, 17, 30) // 5:30 PM
        
        val breakTimeMinutes = 60 // 1 hour break
        
        val hoursWorked = timeTracker.calculateHoursWorkedWithBreaks(
            startTime.time, 
            endTime.time, 
            breakTimeMinutes
        )
        
        assertEquals(7.5, hoursWorked, 0.01) // 8.5 - 1 = 7.5 hours
    }

    @Test
    fun testJobEstimateAccuracy() {
        val estimatedHours = 8.0
        val actualHours = 7.5
        
        val accuracyPercentage = jobCalculator.calculateEstimateAccuracy(estimatedHours, actualHours)
        
        assertEquals(93.75, accuracyPercentage, 0.01) // (7.5/8.0) * 100 = 93.75%
    }

    @Test
    fun testInvalidJobCostCalculation() {
        // Test edge cases and invalid inputs
        try {
            jobCalculator.calculateJobCost(-50.0, 8.0, 200.0)
            fail("Should throw exception for negative hourly rate")
        } catch (e: IllegalArgumentException) {
            assertTrue(e.message!!.contains("Hourly rate must be positive"))
        }
    }

    @Test
    fun testWorkerRatingCalculation() {
        val ratings = listOf(5.0, 4.0, 5.0, 3.0, 4.0)
        val averageRating = jobCalculator.calculateAverageRating(ratings)
        
        assertEquals(4.2, averageRating, 0.01)
    }

    @Test
    fun testEmptyRatingsList() {
        val ratings = emptyList<Double>()
        val averageRating = jobCalculator.calculateAverageRating(ratings)
        
        assertEquals(0.0, averageRating, 0.01)
    }

    @Test
    fun testJobStatusValidation() {
        assertTrue(jobCalculator.isValidJobStatus("pending"))
        assertTrue(jobCalculator.isValidJobStatus("in_progress"))
        assertTrue(jobCalculator.isValidJobStatus("completed"))
        assertFalse(jobCalculator.isValidJobStatus("invalid_status"))
        assertFalse(jobCalculator.isValidJobStatus(""))
    }

    @Test
    fun testMockTimeTracker() {
        // Example of using Mockito for mocking dependencies
        val mockTimeTracker = mock(TimeTracker::class.java)
        
        val startDate = Date()
        val endDate = Date(startDate.time + 8 * 60 * 60 * 1000) // 8 hours later
        
        `when`(mockTimeTracker.calculateHoursWorked(startDate, endDate)).thenReturn(8.0)
        
        val hoursWorked = mockTimeTracker.calculateHoursWorked(startDate, endDate)
        
        assertEquals(8.0, hoursWorked, 0.01)
        verify(mockTimeTracker).calculateHoursWorked(startDate, endDate)
    }
}

/**
 * Sample business logic class for job calculations
 * This demonstrates the kind of business logic that should be unit tested
 */
class JobCalculator {
    
    fun calculateJobCost(hourlyRate: Double, hoursWorked: Double, materialCost: Double): Double {
        if (hourlyRate < 0) throw IllegalArgumentException("Hourly rate must be positive")
        if (hoursWorked < 0) throw IllegalArgumentException("Hours worked must be positive")
        if (materialCost < 0) throw IllegalArgumentException("Material cost must be positive")
        
        return (hourlyRate * hoursWorked) + materialCost
    }
    
    fun calculateJobCostWithTax(hourlyRate: Double, hoursWorked: Double, materialCost: Double, taxRate: Double): Double {
        val baseCost = calculateJobCost(hourlyRate, hoursWorked, materialCost)
        return baseCost * (1 + taxRate)
    }
    
    fun calculateEstimateAccuracy(estimatedHours: Double, actualHours: Double): Double {
        if (estimatedHours <= 0) return 0.0
        return (actualHours / estimatedHours) * 100
    }
    
    fun calculateAverageRating(ratings: List<Double>): Double {
        if (ratings.isEmpty()) return 0.0
        return ratings.average()
    }
    
    fun isValidJobStatus(status: String): Boolean {
        val validStatuses = setOf("pending", "in_progress", "completed", "cancelled")
        return status.isNotEmpty() && validStatuses.contains(status)
    }
}

/**
 * Sample time tracking utility class
 * This demonstrates utility functions that should be unit tested
 */
class TimeTracker {
    
    fun calculateHoursWorked(startTime: Date, endTime: Date): Double {
        val diffMillis = endTime.time - startTime.time
        return diffMillis / (1000.0 * 60.0 * 60.0) // Convert to hours
    }
    
    fun calculateHoursWorkedWithBreaks(startTime: Date, endTime: Date, breakTimeMinutes: Int): Double {
        val totalHours = calculateHoursWorked(startTime, endTime)
        val breakHours = breakTimeMinutes / 60.0
        return totalHours - breakHours
    }
}