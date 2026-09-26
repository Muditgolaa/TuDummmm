package com.tudummmm.interview;

import com.tudummmm.interview.dto.CreateSessionRequest;
import com.tudummmm.interview.exception.NotFoundException;
import com.tudummmm.interview.model.Session;
import com.tudummmm.interview.model.SessionStatus;
import com.tudummmm.interview.service.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Integration test: the service layer against a real Postgres spun up by
// Testcontainers. Proves JPA persistence + per-user ownership.
@SpringBootTest
@Testcontainers
class SessionApiTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    SessionService sessionService;

    @Test
    void creates_a_pending_session_the_owner_can_read() {
        Session s = sessionService.create("user-a",
                new CreateSessionRequest("Java Dev", "Acme", "Spring, Hibernate, SQL"));

        assertThat(s.getId()).isNotNull();
        assertThat(s.getStatus()).isEqualTo(SessionStatus.PENDING);

        Session fetched = sessionService.getOwned("user-a", s.getId());
        assertThat(fetched.getJobTitle()).isEqualTo("Java Dev");
    }

    @Test
    void a_different_user_cannot_access_the_session() {
        Session s = sessionService.create("owner",
                new CreateSessionRequest("Role", null, "JD"));

        assertThatThrownBy(() -> sessionService.getOwned("intruder", s.getId()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void unknown_id_is_not_found() {
        assertThatThrownBy(() -> sessionService.getOwned("user-a", UUID.randomUUID()))
                .isInstanceOf(NotFoundException.class);
    }
}
