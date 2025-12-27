package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO: Semester
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemesterDTO {
    private Integer semesterId;
    private String semesterCode;
    private String semesterName;
    private String academicYear;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer defaultA4Pages;
    private LocalDate pageAllocationDate;
    private Boolean isActive;
    private Boolean isCurrent;
}
