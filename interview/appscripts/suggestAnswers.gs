function suggestAnswers(questions) {
  try {
    // Questions array - stored as a constant for reference
    const INTERVIEW_QUESTIONS = [
      "Name",
      "Mobile", 
      "Email",
      "In 2023, one of our key enterprise clients faced budget cuts of 30% but still needed our full cloud security solution. What was your most challenging price negotiation in a similar situation, and how did you turn a no into a yes while maintaining the relationship and solution value?",
      "Imagine you're leading a HK$10M multi-cloud migration deal where the client's IT team wants AWS, the security team prefers Azure, and the CFO is pushing for the lowest cost option. Describe a similar situation where you had to balance multiple stakeholders' competing interests. How did you manage it?",
      "Our enterprise solutions often require negotiating with procurement teams who focus purely on cost reduction rather than value. Tell me about a time when you faced this situation with a deal worth over HK$5M. What was your strategy?",
      "You notice that your top-performing sales representative, who usually closes 5 deals per quarter, hasn't closed any deals in the past 6 weeks and seems disengaged in team meetings. Share a similar experience where you noticed concerning behavior changes. How did you address it?",
      "A major bank client experiences a 4-hour outage of their cloud services during trading hours, affecting their operations. While it's not directly your product's fault, they're blaming your solution. How did you handle a similar high-pressure situation?",
      "Your development team discovers that a promised AI feature won't be ready for 6 months, affecting multiple enterprise deals worth HK$20M in total. Describe a time when you had to deliver similarly disappointing news to clients. How did you approach it?"
    ];

    // Sample responses
    const responses = {
      questions: INTERVIEW_QUESTIONS,
      answers: [
        "Alex Chen",
        "+852 9123 4567",
        "alex.chen@example.com",
        "In a previous enterprise deal, I faced a similar budget constraint situation with a client who needed our complete security solution despite a 25% budget reduction. I began by conducting a detailed needs analysis to understand their critical requirements and pain points. Then, I developed a phased implementation approach, prioritizing essential security features within their immediate budget while creating a roadmap for adding advanced features over time. I also demonstrated the ROI through detailed cost-benefit analysis and case studies of similar implementations. This approach allowed us to maintain solution integrity while meeting their budget constraints, ultimately securing a HK$8M deal with a 3-year commitment.",
        "I recently managed a HK$12M cloud migration project where stakeholders had conflicting preferences. The development team favored GCP, security wanted Azure, and finance pushed for AWS pricing. I organized structured workshops with each group to document their specific requirements and concerns. Using this input, I created a comprehensive comparison matrix highlighting how different combinations of services could meet their needs. I then proposed a hybrid solution that leveraged Azure's security features while maintaining cost efficiency through strategic use of AWS services. This balanced approach satisfied all stakeholders and led to successful project approval.",
        "During a recent HK$7M enterprise deal, I encountered aggressive procurement tactics focused solely on obtaining the lowest price. Instead of engaging in a price war, I shifted the conversation to total cost of ownership and risk mitigation. I prepared a detailed value analysis showing how our solution would reduce operational costs by 40% over three years and prevent potential security breaches that could cost them millions. By quantifying the long-term benefits and involving key business stakeholders, we successfully justified the investment and closed the deal at our target price point.",
        "I once noticed a similar performance drop in a top sales performer who typically brought in HK$2M quarterly but had missed targets for two months. I scheduled a private meeting to express my concerns and discovered they were dealing with family health issues. I worked with HR to arrange flexible working hours and connected them with our employee assistance program. I also adjusted their quarterly targets temporarily while maintaining clear performance expectations. Through regular check-ins and support, they returned to full productivity within two months.",
        "In a comparable situation, I managed an incident where a financial services client experienced a 2-hour service disruption they attributed to our solution. I immediately assembled a crisis team and established hourly update calls with the client's stakeholders. While investigating, we discovered the root cause was a third-party integration issue. I presented a detailed incident report, implemented new monitoring protocols, and provided a service credit as a goodwill gesture. This transparent approach not only retained the client but led to an expanded partnership worth HK$15M.",
        "When facing a similar situation with a delayed AI feature affecting HK$18M in pipeline deals, I took a proactive approach. I personally contacted each affected client, explaining the situation with transparency and presenting alternative solutions. I developed a comprehensive transition plan that included temporary workarounds and additional support services at no cost. This honest communication strategy helped retain 90% of the affected deals, with clients appreciating our integrity and commitment to their success."
      ]
    };

    return responses;

  } catch (error) {
    Logger.log(`Error in suggestAnswers: ${error.message}`);
    throw error;
  }
}