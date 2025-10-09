package com.foodify.driver.shift.controller;

import com.foodify.driver.shift.dto.DriverShiftBalanceDto;
import com.foodify.driver.shift.service.DriverShiftBalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/driver/shift")
public class DriverShiftController {

    private final DriverShiftBalanceService balanceService;

    public DriverShiftController(DriverShiftBalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping("/balance")
    public ResponseEntity<DriverShiftBalanceDto> getCurrentShiftBalance(
        @RequestAttribute(name = "driverId", required = false) Long driverId
    ) {
        Long resolvedDriverId = driverId != null ? driverId : 0L;
        DriverShiftBalanceDto balance = balanceService.getCurrentShiftBalance(resolvedDriverId);
        return ResponseEntity.ok(balance);
    }
}
