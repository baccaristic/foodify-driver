package com.foodify.driver.shift.dto;

import java.math.BigDecimal;

public class DriverShiftBalanceDto {

    private final BigDecimal currentTotal;

    public DriverShiftBalanceDto(BigDecimal currentTotal) {
        this.currentTotal = currentTotal;
    }

    public BigDecimal getCurrentTotal() {
        return currentTotal;
    }
}
