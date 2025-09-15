// Mock local model that simulates your GGUF model
export async function completeChat(messages) {
  // Simulate processing time for a local model
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  
  // Add specific responses for common requests
  if (lastUserMessage.toLowerCase().includes('hello') || lastUserMessage.toLowerCase().includes('hi')) {
    return ` Hello! I'm Vox, your local AI assistant running the GPT-OSS-20B model. I'm processing your request locally without any external API calls. How can I help you today?`;
  }
  
  if (lastUserMessage.toLowerCase().includes('how are you')) {
    return ` I'm running smoothly on your local hardware! My 20B parameters are processing your request in real-time. I'm here to help with any questions you might have.`;
  }
  
  if (lastUserMessage.toLowerCase().includes('what can you do')) {
    return ` As a local AI model, I can help you with:
    - Answering questions and providing explanations
    - Creative writing and brainstorming
    - Code assistance and technical help
    - General conversation and analysis
    - All while keeping your data completely private on your local machine!`;
  }
  
  if (lastUserMessage.toLowerCase().includes('model') || lastUserMessage.toLowerCase().includes('parameters')) {
    return ` I'm Vox model running locally on your system. With only a few parameters, I can handle complex reasoning tasks while maintaining complete privacy. No data leaves your machine!`;
  }
  
  // Code examples
  if (lastUserMessage.toLowerCase().includes('php') && lastUserMessage.toLowerCase().includes('code')) {
    return ` Here's a PHP code example for you:

\`\`\`php
<?php
// Simple PHP class example
class User {
    private $name;
    private $email;
    
    public function __construct($name, $email) {
        $this->name = $name;
        $this->email = $email;
    }
    
    public function getName() {
        return $this->name;
    }
    
    public function getEmail() {
        return $this->email;
    }
    
    public function displayInfo() {
        echo "Name: " . $this->name . ", Email: " . $this->email;
    }
}

// Usage
$user = new User("John Doe", "john@example.com");
$user->displayInfo();
?>
\`\`\`

This example shows object-oriented programming in PHP with a simple User class.`;
  }
  
  if (lastUserMessage.toLowerCase().includes('javascript') && lastUserMessage.toLowerCase().includes('code')) {
    return ` Here's a JavaScript code example:

\`\`\`javascript
// Modern JavaScript with async/await
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Usage with arrow functions
const processUsers = async (userIds) => {
    const users = await Promise.all(
        userIds.map(id => fetchUserData(id))
    );
    return users.filter(user => user.active);
};

// Example usage
processUsers([1, 2, 3]).then(activeUsers => {
    console.log('Active users:', activeUsers);
});
\`\`\`

This example demonstrates modern JavaScript features like async/await, arrow functions, and Promise handling.`;
  }
  
  if (lastUserMessage.toLowerCase().includes('python') && lastUserMessage.toLowerCase().includes('code')) {
    return ` Here's a Python code example:

\`\`\`python
# Python data processing example
import pandas as pd
from typing import List, Dict

class DataProcessor:
    def __init__(self, data: List[Dict]):
        self.df = pd.DataFrame(data)
    
    def filter_active_users(self) -> pd.DataFrame:
        """Filter users who are active"""
        return self.df[self.df['active'] == True]
    
    def calculate_stats(self) -> Dict[str, float]:
        """Calculate basic statistics"""
        return {
            'mean_age': self.df['age'].mean(),
            'total_users': len(self.df),
            'active_users': len(self.filter_active_users())
        }

# Usage
data = [
    {'name': 'Alice', 'age': 25, 'active': True},
    {'name': 'Bob', 'age': 30, 'active': False},
    {'name': 'Charlie', 'age': 35, 'active': True}
]

processor = DataProcessor(data)
stats = processor.calculate_stats()
print(f"Statistics: {stats}")
\`\`\`

This example shows Python with pandas for data processing and type hints.`;
  }
  
  // General programming help
  if (lastUserMessage.toLowerCase().includes('code') || lastUserMessage.toLowerCase().includes('programming')) {
    return ` I'd be happy to help with programming! Here are some examples I can provide:

**Languages I can help with:**
- PHP: Object-oriented programming, web development
- JavaScript: Modern ES6+, async/await, frameworks
- Python: Data science, web development, automation
- Java: Enterprise applications, Spring framework
- C++: System programming, performance optimization
- Go: Concurrent programming, microservices
- Rust: Memory safety, systems programming

**Topics I can cover:**
- Data structures and algorithms
- Design patterns
- Database design and queries
- API development
- Testing strategies
- Performance optimization
- Security best practices

What specific programming topic or language would you like help with?`;
  }
  
  // Specific topic responses
  if (lastUserMessage.toLowerCase().includes('quesadilla')) {
    return ` A quesadilla is a delicious Mexican dish! Here's what you need to know:

**What is a Quesadilla?**
A quesadilla is a tortilla (usually flour) filled with cheese and other ingredients, then folded in half and cooked until the cheese melts.

**Basic Ingredients:**
- Tortillas (flour or corn)
- Cheese (Oaxaca, Monterey Jack, or Cheddar)
- Optional fillings: chicken, beef, vegetables, beans

**How to Make:**
1. Heat a pan over medium heat
2. Place tortilla in pan
3. Add cheese and fillings to one half
4. Fold tortilla in half
5. Cook 2-3 minutes per side until golden and cheese melts

**Popular Variations:**
- Quesadilla de Pollo (chicken)
- Quesadilla de Huitlacoche (corn fungus)
- Quesadilla de Flor de Calabaza (squash blossoms)

It's a quick, satisfying meal that's perfect for any time of day!`;
  }
  
  if (lastUserMessage.toLowerCase().includes('joke') || lastUserMessage.toLowerCase().includes('jokes')) {
    return ` Here are 2 jokes for you:

**Joke 1:**
Why don't scientists trust atoms?
Because they make up everything!

**Joke 2:**
Why did the scarecrow win an award?
He was outstanding in his field!

**Bonus Programming Joke:**
Why do programmers prefer dark mode?
Because light attracts bugs! 🐛

Hope these brought a smile to your face! I can tell more jokes if you'd like.`;
  }
  
  if (lastUserMessage.toLowerCase().includes('will to live') || lastUserMessage.toLowerCase().includes('motivation')) {
    return ` I understand you're going through a tough time. Here are some strategies that might help:

**Daily Practices:**
- **Gratitude Journal**: Write 3 things you're grateful for each day
- **Small Wins**: Celebrate even tiny accomplishments
- **Routine**: Create a simple daily structure
- **Nature**: Spend time outdoors, even just 10 minutes

**Connection:**
- Reach out to friends or family
- Join communities with shared interests
- Consider talking to a professional counselor
- Volunteer for a cause you care about

**Self-Care:**
- Get enough sleep (7-9 hours)
- Eat regular, nutritious meals
- Exercise, even light walking
- Limit social media/news consumption

**Remember:**
- It's okay to have bad days
- Progress isn't always linear
- You're not alone in feeling this way
- Small steps count

If you're having thoughts of self-harm, please reach out to a mental health professional or crisis hotline immediately. You matter, and there are people who want to help.`;
  }
  
  // General questions
  if (lastUserMessage.toLowerCase().includes('what is') || lastUserMessage.toLowerCase().includes('explain')) {
    const topic = lastUserMessage.replace(/what is|explain/gi, '').trim();
    return ` I'd be happy to explain "${topic}"! 

Based on my small parameter training, I can provide detailed explanations on a wide range of topics including:
- Technology and programming concepts
- Scientific principles and theories
- Historical events and figures
- Business and economics
- Creative writing and literature
- And much more!

Could you be more specific about what aspect of "${topic}" you'd like me to focus on?`;
  }
  
  // Default intelligent response
  return `Based on my analysis of your query, I can help you with this topic. As your local AI assistant running on your system, I'm here to help with programming, technical questions, creative writing, analysis, or any other topic you have in mind!

  Could you provide more specific details about what you'd like to know?`;
}
