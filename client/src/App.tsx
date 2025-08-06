
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Search, Star, Download, Heart, Code, Gamepad2, BookOpen, Palette, Upload, Menu, X } from 'lucide-react';
import type { Application, Category } from '../../server/src/schema';

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [featuredApps, setFeaturedApps] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [appsResult, featuredResult, categoriesResult] = await Promise.all([
        trpc.getApplications.query({ limit: 12 }),
        trpc.getFeaturedApplications.query(),
        trpc.getCategories.query()
      ]);
      setApplications(appsResult);
      setFeaturedApps(featuredResult);
      setCategories(categoriesResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const result = await trpc.getApplications.query({
        search: searchQuery,
        category_id: selectedCategory || undefined,
        limit: 20
      });
      setApplications(result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    try {
      setIsLoading(true);
      const result = await trpc.getApplications.query({
        category_id: categoryId || undefined,
        search: searchQuery || undefined,
        limit: 20
      });
      setApplications(result);
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : star === Math.ceil(rating) && rating % 1 !== 0
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'productivity': return <Code className="h-6 w-6" />;
      case 'entertainment': return <Gamepad2 className="h-6 w-6" />;
      case 'education': return <BookOpen className="h-6 w-6" />;
      case 'creativity': return <Palette className="h-6 w-6" />;
      default: return <Heart className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AppMarket</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Categories</a>
              <a href="#featured" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Featured</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload App
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
                <a href="#categories" className="text-gray-700 hover:text-blue-600 font-medium">Categories</a>
                <a href="#featured" className="text-gray-700 hover:text-blue-600 font-medium">Featured</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="outline" size="sm">Sign In</Button>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload App
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover the Best Apps<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              for Your Needs
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find innovative applications that transform the way you work, play, and create. 
            Join thousands of developers and users in our thriving marketplace.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for apps..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600">
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              🚀 Explore Apps
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-2 hover:bg-gray-50">
              <Upload className="h-5 w-5 mr-2" />
              Upload Your App
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect app for every need, organized into convenient categories
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => handleCategoryFilter(null)}
              className={selectedCategory === null ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
            >
              All Categories
            </Button>
            {categories.map((category: Category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category.id)}
                className={`flex items-center gap-2 ${
                  selectedCategory === category.id ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""
                }`}
              >
                {getCategoryIcon(category.name)}
                {category.name}
              </Button>
            ))}
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category: Category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4 text-blue-500">
                    {getCategoryIcon(category.name)}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apps Section */}
      <section id="featured" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">⭐ Featured Applications</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the most popular and innovative apps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredApps.map((app: Application) => (
              <Card key={app.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                        {app.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{app.short_description || app.description.substring(0, 100) + '...'}</p>
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(app.rating)}
                    <div className="flex items-center text-sm text-gray-500">
                      <Download className="h-4 w-4 mr-1" />
                      {app.download_count.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {app.is_free ? 'Free' : `$${app.price.toFixed(2)}`}
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    {app.is_free ? 'Download' : 'Buy Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Applications Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">All Applications</h2>
            <Button variant="outline" onClick={loadData}>
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No applications found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {applications.map((app: Application) => (
                <Card key={app.id} className="hover:shadow-lg transition-all duration-300 border hover:border-blue-200">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                          {app.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">{app.name}</CardTitle>
                        {app.is_featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      {app.short_description || app.description.substring(0, 80) + '...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {renderStars(app.rating)}
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {app.download_count.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-4">
                    <div className="text-lg font-bold text-gray-900">
                      {app.is_free ? 'Free' : `$${app.price.toFixed(2)}`}
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      {app.is_free ? 'Get' : 'Buy'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Share Your Innovation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of developers who are already earning from their applications. 
            Start selling your apps today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100">
              🚀 Join Now, Sell Your Apps!
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600">
              📧 Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from developers and users who love AppMarket
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "App Developer",
                content: "AppMarket has been incredible for my business. I've sold over 10,000 copies of my productivity app!",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "User",
                content: "I found the perfect tools for my workflow here. The quality of apps is consistently high.",
                rating: 5
              },
              {
                name: "Emily Johnson",
                role: "Indie Developer",
                content: "The platform is so easy to use, and the community is amazing. Highly recommend to any developer!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 border-2">
                <CardContent className="text-center">
                  <div className="flex justify-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center justify-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {testimonial.name.split(' ').map(n => n.charAt(0)).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AM</span>
                </div>
                <span className="text-xl font-bold">AppMarket</span>
              </div>
              <p className="text-gray-400">The leading marketplace for innovative applications.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Developers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Upload Your App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Apps</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 AppMarket. All rights reserved. Made with ❤️ for developers and users.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
