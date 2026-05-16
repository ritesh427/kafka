package com.kafka.mastery.order.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.avro.specific.SpecificRecordBase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Specifically target SpecificRecordBase which generated Avro classes extend
        mapper.addMixIn(SpecificRecordBase.class, AvroMixIn.class);
        return mapper;
    }

    @JsonIgnoreProperties({"schema", "specificData"})
    public abstract static class AvroMixIn {
    }
}
