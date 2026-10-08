package com.example.keycloakdemo.payload.query.page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationPageable {

    private Integer pageNumber;
    private Integer pageSize;
    private Long total;
}
