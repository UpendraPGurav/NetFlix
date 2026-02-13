package com.netflix.clone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailValidationResponse {

    private Boolean exists;
    private Boolean available;
}
