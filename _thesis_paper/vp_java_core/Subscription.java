import java.util.*;

public class Subscription {
    private String id;
    private String userId;
    private SubscriptionTier tier;
    private SubscriptionStatus status;
    private PaymentProvider provider;
    private String providerSubId;
    private Date currentPeriodStart;
    private Date currentPeriodEnd;
    private Date canceledAt;
    private Date trialEndsAt;
    private Boolean trialUsed;
    private Date createdAt;
    private Date updatedAt;
    private User user;
    private List<Payment> payments;
    private List<UsageRecord> usageRecords;
}
