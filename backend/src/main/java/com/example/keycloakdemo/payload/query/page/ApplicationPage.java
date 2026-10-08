package com.example.keycloakdemo.payload.query.page;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Getter
@Setter
public class ApplicationPage<T> {

  private List<T> content;
  private ApplicationPageable pageable;

  public ApplicationPage(Page<T> page) {
    this.content = page.getContent();
    this.pageable =
        ApplicationPageable.builder()
            .pageNumber(page.getPageable().getPageNumber())
            .pageSize(page.getPageable().getPageSize())
            .total(page.getTotalElements())
            .build();
  }

  public ApplicationPage(List<T> content, Pageable pageable) {
    this.content = content;
    this.pageable =
        ApplicationPageable.builder()
            .pageNumber(pageable.getPageNumber())
            .pageSize(pageable.getPageSize())
            .total((long) content.size())
            .build();
  }
}
