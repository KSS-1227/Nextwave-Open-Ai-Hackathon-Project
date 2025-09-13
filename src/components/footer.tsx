import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const quickLinks = [
    { label: "How it Works", href: "#demo" },
    { label: "Pricing", href: "#pricing" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "MSME Resources", href: "#" }
  ];

  const businessTypes = [
    "Electronics Shops",
    "Grocery Stores", 
    "Textile Businesses",
    "Restaurants",
    "Medical Stores",
    "Auto Parts",
    "Hardware Stores",
    "Stationery Shops"
  ];

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">₹</span>
              </div>
              <span className="text-xl font-bold">VirtualCFO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI CFO for Indian Small Businesses. Making enterprise-level financial intelligence accessible to every MSME.
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>VirtualCFO Technologies</p>
              <p>Mumbai, Maharashtra, India</p>
              <p>hello@virtualcfo.in</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Types */}
          <div>
            <h3 className="font-semibold mb-4">Built For</h3>
            <ul className="space-y-2">
              {businessTypes.map((business) => (
                <li key={business}>
                  <span className="text-sm text-muted-foreground">
                    {business}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Get Started Today</h3>
            <p className="text-sm text-muted-foreground">
              Join thousands of Indian small businesses already using VirtualCFO to boost their profits.
            </p>
            <Button className="w-full bg-gradient-primary hover:opacity-90">
              Start Free Trial
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1">
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Call Us
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 VirtualCFO Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Made in India 🇮🇳</span>
            <span>•</span>
            <span>For Indian MSMEs</span>
            <span>•</span>
            <span>Hindi + English Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}