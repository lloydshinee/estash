import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import MarketingNav from "@/components/marketing-nav";
import Link from "next/link";
import { MapPin, Shield, Clock, Star, Luggage, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Secure Luggage Storage
            <br />
            <span className="text-blue-600">Anywhere, Anytime</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Store your luggage safely with verified hosts while you explore the
            city hands-free. Book by the hour, pay in cash, and travel with
            peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/browse">Find Storage Near You</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-up">Become a Stasher</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Stash?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make luggage storage simple, secure, and accessible everywhere
              you travel.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Verified & Secure</CardTitle>
                <CardDescription>
                  All storage hosts are background-checked and locations are
                  verified for safety.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Flexible Hours</CardTitle>
                <CardDescription>
                  Book storage by the hour with no minimum stay. Perfect for
                  layovers or day trips.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Convenient Locations</CardTitle>
                <CardDescription>
                  Find storage near airports, train stations, hotels, and
                  popular attractions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Simple steps to secure storage
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Search & Book</h3>
              <p className="text-muted-foreground text-sm">
                Find storage locations near you and book for the hours you need.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Drop Off</h3>
              <p className="text-muted-foreground text-sm">
                Bring your luggage to the verified host location during business
                hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Explore Free</h3>
              <p className="text-muted-foreground text-sm">
                Enjoy your time without heavy bags while your items stay secure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Pick Up</h3>
              <p className="text-muted-foreground text-sm">
                Return to collect your luggage and pay the host in cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-muted-foreground">Storage Locations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10k+</div>
              <div className="text-muted-foreground">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">4.9</div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-current" />
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Travel Light?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of travelers who trust Stash for secure luggage
            storage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/browse">Find Storage Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-up">Start Hosting</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Luggage className="h-6 w-6 text-blue-600" />
                <span className="font-bold">Stash</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Secure luggage storage for modern travelers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Travelers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/browse" className="hover:text-foreground">
                    Find Storage
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-foreground">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Hosts</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/become-host" className="hover:text-foreground">
                    Become a Host
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host-requirements"
                    className="hover:text-foreground"
                  >
                    Requirements
                  </Link>
                </li>
                <li>
                  <Link href="/earnings" className="hover:text-foreground">
                    Earnings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-foreground">
                    Safety
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2026 Stash. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
