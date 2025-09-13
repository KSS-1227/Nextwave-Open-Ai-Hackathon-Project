import { AlertCircle, TrendingDown, Settings } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: AlertCircle,
      title: "No Financial Expertise",
      description: "Most owners are product experts, not finance experts. Without CFO-level insights, profitable opportunities are missed daily."
    },
    {
      icon: TrendingDown,
      title: "Hidden Cost Leaks",
      description: "Losing ₹2L+ annually due to poor financial decisions. Small inefficiencies compound into massive losses over time."
    },
    {
      icon: Settings,
      title: "Complex Tools",
      description: "Existing solutions are built for big companies, not local shops. Too complicated, too expensive, too irrelevant."
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Why 90% of Small Businesses Struggle Financially
          </h2>
          <p className="text-lg text-muted-foreground">
            Despite being the backbone of India's economy, MSMEs face unique financial challenges 
            that traditional tools completely ignore.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon;
            return (
              <div key={index} className="bg-card rounded-lg p-8 card-hover border text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-card border border-warning/20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg">
              <span className="font-bold text-warning">Result:</span> 
              {" "}Indian small businesses lose an average of{" "}
              <span className="font-bold text-currency-negative">₹2,40,000 annually</span>
              {" "}due to preventable financial mistakes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}