import java.util.*;

public class User {
    private String id;
    private String email;
    private String password;
    private String googleId;
    private String avatar;
    private String firstName;
    private String lastName;
    private UserRole role;
    private Boolean isActive;
    private Date createdAt;
    private Date updatedAt;
    private List<FoundationPronunciationAttempt> pronunciationAttempts;
    private List<FoundationPronunciationProgress> pronunciationProgress;
    private List<FoundationVocabProgress> vocabularyProgress;
    private List<FoundationGrammarProgress> grammarProgress;
}
