package com.handyman.pro

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before
import org.junit.After
import org.mockito.Mockito.*
import java.util.*

/**
 * Integration tests for JobViewModel combining JobCalculator and TimeTracker
 * 
 * This class demonstrates integration testing by combining multiple components
 * to test end-to-end workflows and business logic interactions.
 * 
 * Prerequisites:
 * - Add to build.gradle (app level):
 *   testImplementation 'junit:junit:4.13.2'
 *   testImplementation 'org.mockito:mockito-core:4.6.1'
 *   testImplementation 'org.mockito:mockito-inline:4.6.1'
 */
class JobViewModelTest {

    private lateinit var jobViewModel: JobViewModel
    private lateinit var jobCalculator: JobCalculator
    private lateinit var timeTracker: TimeTracker

    @Before
    fun setUp() {
        jobCalculator = JobCalculator()
        timeTracker = TimeTracker()
        jobViewModel = JobViewModel(jobCalculator, timeTracker)
    }

    @After
    fun tearDown() {
        // Clean up any resources if needed
    }

    @Test
    fun testCompleteJobWorkflow() {
        // Test the complete workflow from time tracking to cost calculation
        val startTime = Calendar.getInstance()
        startTime.set(2024, 0, 1, 9, 0) // 9:00 AM
        
        val endTime = Calendar.getInstance()
        endTime.set(2024, 0, 1, 17, 0) // 5:00 PM
        
        val hourlyRate = 75.0
        val materialCost = 150.0
        val taxRate = 0.10
        
        // Create a complete job
        val jobSummary = jobViewModel.calculateCompleteJobCost(
            startTime.time, 
            endTime.time, 
            hourlyRate, 
            materialCost, 
            taxRate
        )
        
        // Verify the integration works correctly
        assertEquals(8.0, jobSummary.hoursWorked, 0.01) // 8 hours worked
        assertEquals(600.0, jobSummary.laborCost, 0.01) // 75 * 8 = 600
        assertEquals(750.0, jobSummary.totalBeforeTax, 0.01) // 600 + 150 = 750
        assertEquals(825.0, jobSummary.totalWithTax, 0.01) // 750 * 1.10 = 825
    }

    @Test
    fun testJobWorkflowWithBreaks() {
        // Test workflow including break time
        val startTime = Calendar.getInstance()
        startTime.set(2024, 0, 1, 8, 0) // 8:00 AM
        
        val endTime = Calendar.getInstance()
        endTime.set(2024, 0, 1, 18, 0) // 6:00 PM
        
        val breakTimeMinutes = 60 // 1 hour lunch break
        val hourlyRate = 60.0
        val materialCost = 200.0
        
        val jobSummary = jobViewModel.calculateJobCostWithBreaks(
            startTime.time,
            endTime.time,
            breakTimeMinutes,
            hourlyRate,
            materialCost
        )
        
        // 10 hours total - 1 hour break = 9 hours worked
        assertEquals(9.0, jobSummary.hoursWorked, 0.01)
        assertEquals(540.0, jobSummary.laborCost, 0.01) // 60 * 9 = 540
        assertEquals(740.0, jobSummary.totalBeforeTax, 0.01) // 540 + 200 = 740
    }

    @Test
    fun testMultipleJobsEstimateAccuracy() {
        // Test estimate accuracy across multiple jobs
        val job1Estimated = 6.0
        val job1Actual = 5.5
        
        val job2Estimated = 4.0
        val job2Actual = 4.5
        
        val job3Estimated = 8.0
        val job3Actual = 7.0
        
        val jobs = listOf(
            JobData(job1Estimated, job1Actual),
            JobData(job2Estimated, job2Actual),
            JobData(job3Estimated, job3Actual)
        )
        
        val overallAccuracy = jobViewModel.calculateOverallEstimateAccuracy(jobs)
        
        // Average accuracy should be calculated correctly
        // Job 1: 5.5/6.0 * 100 = 91.67%
        // Job 2: 4.5/4.0 * 100 = 112.5% (over estimate, but still accuracy)
        // Job 3: 7.0/8.0 * 100 = 87.5%
        // Average: (91.67 + 112.5 + 87.5) / 3 = 97.22%
        assertEquals(97.22, overallAccuracy, 0.1)
    }

    @Test
    fun testJobViewModelWithMockDependencies() {
        // Test using mocked dependencies for isolation
        val mockCalculator = mock(JobCalculator::class.java)
        val mockTimeTracker = mock(TimeTracker::class.java)
        val jobViewModelWithMocks = JobViewModel(mockCalculator, mockTimeTracker)
        
        val startTime = Date()
        val endTime = Date(startTime.time + 8 * 60 * 60 * 1000) // 8 hours later
        
        // Setup mock behavior
        `when`(mockTimeTracker.calculateHoursWorked(startTime, endTime)).thenReturn(8.0)
        `when`(mockCalculator.calculateJobCost(50.0, 8.0, 100.0)).thenReturn(500.0)
        `when`(mockCalculator.calculateJobCostWithTax(50.0, 8.0, 100.0, 0.08)).thenReturn(540.0)
        
        val jobSummary = jobViewModelWithMocks.calculateCompleteJobCost(
            startTime, endTime, 50.0, 100.0, 0.08
        )
        
        // Verify mock interactions
        verify(mockTimeTracker).calculateHoursWorked(startTime, endTime)
        verify(mockCalculator).calculateJobCost(50.0, 8.0, 100.0)
        verify(mockCalculator).calculateJobCostWithTax(50.0, 8.0, 100.0, 0.08)
        
        assertEquals(8.0, jobSummary.hoursWorked, 0.01)
        assertEquals(400.0, jobSummary.laborCost, 0.01) // 50 * 8
        assertEquals(540.0, jobSummary.totalWithTax, 0.01)
    }

    @Test
    fun testInvalidJobDataHandling() {
        // Test error handling in the integration layer
        val startTime = Calendar.getInstance()
        startTime.set(2024, 0, 1, 9, 0)
        
        val endTime = Calendar.getInstance()
        endTime.set(2024, 0, 1, 8, 0) // End time before start time
        
        try {
            jobViewModel.calculateCompleteJobCost(
                startTime.time, 
                endTime.time, 
                50.0, 
                100.0, 
                0.08
            )
            fail("Should throw exception for invalid time range")
        } catch (e: IllegalArgumentException) {
            assertTrue(e.message!!.contains("End time must be after start time"))
        }
    }

    @Test
    fun testJobStatusWorkflow() {
        // Test job status transitions through the workflow
        val job = JobData(8.0, 0.0) // Estimated 8 hours, no actual time yet
        
        // Initial status should be pending
        assertEquals("pending", jobViewModel.getJobStatus(job))
        
        // Start the job
        jobViewModel.startJob(job)
        assertEquals("in_progress", jobViewModel.getJobStatus(job))
        
        // Complete the job with actual time
        job.actualHours = 7.5
        jobViewModel.completeJob(job)
        assertEquals("completed", jobViewModel.getJobStatus(job))
        
        // Calculate final accuracy
        val accuracy = jobViewModel.calculateJobAccuracy(job)
        assertEquals(93.75, accuracy, 0.01) // 7.5/8.0 * 100
    }
}

/**
 * JobViewModel class that integrates JobCalculator and TimeTracker
 * This demonstrates how to combine multiple business logic components
 */
class JobViewModel(
    private val jobCalculator: JobCalculator,
    private val timeTracker: TimeTracker
) {
    
    fun calculateCompleteJobCost(
        startTime: Date, 
        endTime: Date, 
        hourlyRate: Double, 
        materialCost: Double, 
        taxRate: Double
    ): JobSummary {
        // Validate input
        if (endTime.time <= startTime.time) {
            throw IllegalArgumentException("End time must be after start time")
        }
        
        val hoursWorked = timeTracker.calculateHoursWorked(startTime, endTime)
        val laborCost = hourlyRate * hoursWorked
        val totalBeforeTax = jobCalculator.calculateJobCost(hourlyRate, hoursWorked, materialCost)
        val totalWithTax = jobCalculator.calculateJobCostWithTax(hourlyRate, hoursWorked, materialCost, taxRate)
        
        return JobSummary(
            hoursWorked = hoursWorked,
            laborCost = laborCost,
            materialCost = materialCost,
            totalBeforeTax = totalBeforeTax,
            totalWithTax = totalWithTax
        )
    }
    
    fun calculateJobCostWithBreaks(
        startTime: Date,
        endTime: Date,
        breakTimeMinutes: Int,
        hourlyRate: Double,
        materialCost: Double
    ): JobSummary {
        val hoursWorked = timeTracker.calculateHoursWorkedWithBreaks(startTime, endTime, breakTimeMinutes)
        val laborCost = hourlyRate * hoursWorked
        val totalBeforeTax = jobCalculator.calculateJobCost(hourlyRate, hoursWorked, materialCost)
        
        return JobSummary(
            hoursWorked = hoursWorked,
            laborCost = laborCost,
            materialCost = materialCost,
            totalBeforeTax = totalBeforeTax,
            totalWithTax = totalBeforeTax // No tax in this version
        )
    }
    
    fun calculateOverallEstimateAccuracy(jobs: List<JobData>): Double {
        if (jobs.isEmpty()) return 0.0
        
        val accuracies = jobs.map { job ->
            jobCalculator.calculateEstimateAccuracy(job.estimatedHours, job.actualHours)
        }
        
        return accuracies.average()
    }
    
    fun getJobStatus(job: JobData): String {
        return when {
            job.actualHours == 0.0 && !job.isStarted -> "pending"
            job.actualHours == 0.0 && job.isStarted -> "in_progress"
            job.actualHours > 0.0 -> "completed"
            else -> "unknown"
        }
    }
    
    fun startJob(job: JobData) {
        job.isStarted = true
    }
    
    fun completeJob(job: JobData) {
        job.isCompleted = true
    }
    
    fun calculateJobAccuracy(job: JobData): Double {
        return jobCalculator.calculateEstimateAccuracy(job.estimatedHours, job.actualHours)
    }
}

/**
 * Data class representing a job summary with all calculated costs
 */
data class JobSummary(
    val hoursWorked: Double,
    val laborCost: Double,
    val materialCost: Double,
    val totalBeforeTax: Double,
    val totalWithTax: Double
)

/**
 * Data class representing job data for testing
 */
data class JobData(
    val estimatedHours: Double,
    var actualHours: Double,
    var isStarted: Boolean = false,
    var isCompleted: Boolean = false
)