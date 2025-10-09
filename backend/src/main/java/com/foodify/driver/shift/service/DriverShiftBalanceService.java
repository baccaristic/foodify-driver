package com.foodify.driver.shift.service;

import com.foodify.driver.shift.dto.DriverShiftBalanceDto;
import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.stereotype.Service;

@Service
public class DriverShiftBalanceService {

    private final Map<Long, AtomicReference<BigDecimal>> driverBalances = new ConcurrentHashMap<>();

    public DriverShiftBalanceDto getCurrentShiftBalance(Long driverId) {
        BigDecimal total = driverBalances
            .computeIfAbsent(driverId, id -> new AtomicReference<>(BigDecimal.ZERO))
            .get();
        return new DriverShiftBalanceDto(total);
    }

    public void addEarnings(Long driverId, BigDecimal amount) {
        if (driverId == null || amount == null) {
            return;
        }

        driverBalances
            .computeIfAbsent(driverId, id -> new AtomicReference<>(BigDecimal.ZERO))
            .updateAndGet(existing -> existing.add(amount));
    }

    public void resetBalance(Long driverId) {
        if (driverId == null) {
            return;
        }

        driverBalances
            .computeIfAbsent(driverId, id -> new AtomicReference<>(BigDecimal.ZERO))
            .set(BigDecimal.ZERO);
    }
}
