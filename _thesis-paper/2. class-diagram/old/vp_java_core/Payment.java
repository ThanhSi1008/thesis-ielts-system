import java.util.*;

public class Payment {
    private String id;
    private String subscriptionId;
    private Integer amount;
    private String currency;
    private PaymentProvider provider;
    private String providerPayId;
    private String status;
    private Object metadata;
    private Date createdAt;
    private Subscription subscription;
}
