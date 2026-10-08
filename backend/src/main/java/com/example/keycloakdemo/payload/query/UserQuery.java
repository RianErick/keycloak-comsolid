package com.example.keycloakdemo.payload.query;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserQuery extends BaseQuery {

    private String username;
    private String firstName;
    private String lastName;
    private String email;

    public UserQuery() {
        super(Map.of(
            "id", "id",
            "username", "username",
            "firstName", "firstName",
            "lastName", "lastName",
            "email", "email",
            "createdAt", "createdAt",
            "updatedAt", "updatedAt"
        ));
    }

    @Override
    @Schema(
        defaultValue = "id",
        allowableValues = {
            "id", "username", "firstName", "lastName", "email", "createdAt", "updatedAt",
            "-id", "-username", "-firstName", "-lastName", "-email", "-createdAt", "-updatedAt"
        }
    )
    public String getOrderBy() {
        return super.getOrderBy();
    }
}
