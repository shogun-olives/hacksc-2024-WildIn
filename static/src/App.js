import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Hammer, Package, Camera, Leaf, ChevronRight, Home } from 'lucide-react';

const SurvivalPlatform = () => {
  const [activeTab, setActiveTab] = useState('scan'); 
  const [inventory, setInventory] = useState([]); 

  const tabs = [
    { id: 'home', icon: <Home size={40} />, label: 'Home' },
    { id: 'scan', icon: <Camera size={40} />, label: 'Scan' },
    { id: 'learn', icon: <BookOpen size={40} />, label: 'Learn' },
    { id: 'craft', icon: <Hammer size={40} />, label: 'Craft' },
    { id: 'inventory', icon: <Package size={40} />, label: 'Inventory' }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomeView inventory={inventory} />;
      case 'scan':
        return <ScanView setActiveTab={setActiveTab} />;
      case 'learn':
        return <LearnView inventory={inventory} />;
      case 'craft':
        return <CraftView inventory={inventory} />;
      case 'inventory':
        return <InventoryView inventory={inventory} setInventory={setInventory} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans font">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Leaf className="text-green-500" size={50} />
            <button 
              onClick={() => setActiveTab('home')} 
              className="text-5xl font-bold hover:text-green-600 transition-colors"
            >
              WildIn
            </button>
          </div>
            <div className="flex space-x-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-green-300 text-gray-900' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium text-xl">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
};

const HomeView = ({ inventory }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your foraging assistant. I can help you identify plants, suggest uses for items in your inventory, and provide foraging advice." 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {  // Update this URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          inventory: inventory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white rounded-xl shadow-sm p-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about foraging, plant identification, or your inventory..."
          className="flex-1 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

const LearnView = ({ inventory }) => {
  const [openCategories, setOpenCategories] = useState(new Set());
  const [selectedPlant, setSelectedPlant] = useState(null);
  
  const toggleCategory = (rarity) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(rarity)) {
      newOpenCategories.delete(rarity);
    } else {
      newOpenCategories.add(rarity);
    }
    setOpenCategories(newOpenCategories);
  };
  
  const floraByRarity = {
    'Common': [
      {
        name: 'Dandelion',
        icon: '🌼',
        description: 'Widespread flowering plant with yellow blooms',
        purposes: ['Food', 'Medicine', 'Tea'],
        characteristics: ['Yellow flowers', 'Hollow stems', 'Tooth-shaped leaves'],
        identification: 'Look for rosette pattern at base, distinct yellow flower head',
        location: 'Lawns, fields, disturbed areas'
      },
      {
        name: 'Nettle',
        icon: '🌿',
        description: 'Stinging plant with nutritious leaves',
        purposes: ['Food', 'Medicine', 'Fiber'],
        characteristics: ['Serrated leaves', 'Small hairs', 'Green stems'],
        identification: 'Look for opposite leaves with teeth, stinging hairs',
        location: 'Moist areas, woodland edges'
      }
    ],
    'Uncommon': [
      {
        name: 'Yarrow',
        icon: '🌸',
        description: 'Flowering herb with feathery leaves',
        purposes: ['Medicine', 'Wound healing'],
        characteristics: ['White flowers', 'Feathery leaves'],
        identification: 'Feather-like leaves, flat-topped flower clusters',
        location: 'Fields, meadows'
      }
    ]
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Panel - Categories and Plants */}
      <div className="w-1/3 space-y-4 overflow-y-auto">
        {Object.entries(floraByRarity).map(([rarity, plants]) => (
          <div key={rarity} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCategory(rarity)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl font-semibold">{rarity}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {plants.filter(plant => inventory.some(item => item.name === plant.name)).length} / {plants.length} discovered
                </span>
                <span className="text-green-500 transition-transform duration-200" 
                  style={{ transform: openCategories.has(rarity) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${
              openCategories.has(rarity) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}>
              {plants.map(plant => (
                <button
                  key={plant.name}
                  onClick={() => setSelectedPlant(plant)}
                  className={`w-full px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 
                    transition-all duration-200 shadow-sm hover:shadow-md
                    ${selectedPlant?.name === plant.name ? 'bg-green-50 shadow-md' : ''}`}
                >
                  <span className="text-2xl">{plant.icon}</span>
                  <span className="text-lg">{plant.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel - Plant Details */}
      <div className="w-2/3">
        {selectedPlant ? (
          <div 
            key={selectedPlant.name}
            className="bg-white rounded-xl p-6 shadow-sm h-full 
              transition-all duration-300 ease-in-out 
              opacity-0 animate-fadeIn"
          >
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-4xl">{selectedPlant.icon}</span>
              <h2 className="text-2xl font-semibold">{selectedPlant.name}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="transition-all duration-300 delay-100">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600">{selectedPlant.description}</p>
              </div>

              <div className="transition-all duration-300 delay-200">
                <h3 className="text-lg font-medium mb-2">Purposes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPlant.purposes.map(purpose => (
                    <span key={purpose} 
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full shadow-sm">
                      {purpose}
                    </span>
                  ))}
                </div>
              </div>

              <div className="transition-all duration-300 delay-300">
                <h3 className="text-lg font-medium mb-2">Characteristics</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {selectedPlant.characteristics.map(char => (
                    <li key={char}>{char}</li>
                  ))}
                </ul>
              </div>

              <div className="transition-all duration-300 delay-400">
                <h3 className="text-lg font-medium mb-2">How to Identify</h3>
                <p className="text-gray-600">{selectedPlant.identification}</p>
              </div>

              <div className="transition-all duration-300 delay-500">
                <h3 className="text-lg font-medium mb-2">Where to Find</h3>
                <p className="text-gray-600">{selectedPlant.location}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-2xl" >
            Select a plant to view details
          </div>
        )}
      </div>
    </div>
  );
};

const CraftView = ({ inventory }) => {
  const [openCategories, setOpenCategories] = useState(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState(new Set());
  
  const toggleCategory = (category) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(category)) {
      newOpenCategories.delete(category);
    } else {
      newOpenCategories.add(category);
    }
    setOpenCategories(newOpenCategories);
  };

  const recipeCategories = {
    'Saved Recipes': {
      icon: '⭐',
      recipes: [] // This will be populated dynamically
    },
    'Medicinals': {
      icon: '💊',
      recipes: [
        {
          name: 'Yarrow Poultice',
          materials: [
            { name: 'Yarrow', amount: '3', icon: '🌿' },
            { name: 'Clean Cloth', amount: '1', icon: '🧺' },
            { name: 'Water', amount: '100ml', icon: '💧' }
          ],
          method: 'Crush fresh yarrow leaves, mix with small amount of water to form paste. Apply to cloth and place on wound.',
          effects: 'Helps stop bleeding, reduces inflammation',
          difficulty: 'Easy',
          time: '5-10 minutes'
        },
        {
          name: 'Willow Bark Tea',
          materials: [
            { name: 'Willow Bark', amount: '2', icon: '🌳' },
            { name: 'Water', amount: '200ml', icon: '💧' },
            { name: 'Container', amount: '1', icon: '🫖' }
          ],
          method: 'Strip bark, boil in water for 10-15 minutes, strain and cool.',
          effects: 'Pain relief, fever reduction',
          difficulty: 'Medium',
          time: '15-20 minutes'
        }
      ]
    },
    'Food': {
      icon: '🍱',
      recipes: [
        {
          name: 'Wild Salad',
          materials: [
            { name: 'Dandelion Leaves', amount: '5', icon: '🌱' },
            { name: 'Chickweed', amount: '3', icon: '🌿' },
            { name: 'Wood Sorrel', amount: '4', icon: '🍀' }
          ],
          method: 'Clean leaves thoroughly, tear into bite-sized pieces, combine.',
          effects: 'Basic nutrition, vitamin C',
          difficulty: 'Easy',
          time: '5 minutes'
        }
      ]
    },
    'Thirst': {
      icon: '🥤',
      recipes: [
        {
          name: 'Pine Needle Tea',
          materials: [
            { name: 'Young Pine Needles', amount: '12', icon: '🌲' },
            { name: 'Water', amount: '250ml', icon: '💧' },
            { name: 'Container', amount: '1', icon: '🫖' }
          ],
          method: 'Chop needles, steep in hot water for 5-10 minutes.',
          effects: 'Hydration, vitamin C',
          difficulty: 'Easy',
          time: '10 minutes'
        }
      ]
    }
  };

  const toggleSaveRecipe = (recipe) => {
    const newSavedRecipes = new Set(savedRecipes);
    if (newSavedRecipes.has(recipe.name)) {
      newSavedRecipes.delete(recipe.name);
    } else {
      newSavedRecipes.add(recipe.name);
    }
    setSavedRecipes(newSavedRecipes);
  };

  // Get saved recipes list
  recipeCategories['Saved Recipes'].recipes = Object.values(recipeCategories)
    .flatMap(category => category.recipes)
    .filter(recipe => savedRecipes.has(recipe.name));

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Panel - Categories and Recipes */}
      <div className="w-1/3 space-y-4 overflow-y-auto">
        {Object.entries(recipeCategories).map(([category, { icon, recipes }]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl font-semibold">{category}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {recipes.filter(recipe => 
                    recipe.materials.every(material => 
                      inventory.find(item => item.name === material.name && item.quantity >= material.amount)
                    )
                  ).length} / {recipes.length} available
                </span>
                <span className="text-green-500 transition-transform duration-200" 
                  style={{ transform: openCategories.has(category) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${
              openCategories.has(category) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}>
              {recipes.map(recipe => (
                <button
                  key={recipe.name}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`w-full px-6 py-3 text-left hover:bg-gray-50 
                    transition-all duration-200 shadow-sm hover:shadow-md
                    ${selectedRecipe?.name === recipe.name ? 'bg-green-50 shadow-md' : ''}`}
                >
                  <span className="text-lg">{recipe.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel - Recipe Details */}
      <div className="w-2/3">
        {selectedRecipe ? (
          <div 
            key={selectedRecipe.name}
            className="bg-white rounded-xl p-6 shadow-sm h-full 
              transition-all duration-300 ease-in-out 
              opacity-0 animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{selectedRecipe.name}</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleSaveRecipe(selectedRecipe)}
                  className={`text-2xl transition-transform hover:scale-110
                    ${savedRecipes.has(selectedRecipe.name) ? 'opacity-100' : 'opacity-50'}`}
                >
                  ⭐
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {selectedRecipe.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {selectedRecipe.time}
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-medium mb-3">Materials Needed</h3>
                <ul className="space-y-2">
                  {selectedRecipe.materials.map(material => (
                    <li key={material.name} className="flex items-center space-x-3">
                      <span className="text-2xl">{material.icon}</span>
                      <span className="text-gray-600">{material.amount} {material.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Method</h3>
                <p className="text-gray-600">{selectedRecipe.method}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Effects</h3>
                <p className="text-gray-600">{selectedRecipe.effects}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-2xl">
            Select a recipe to view details
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryView = () => {
  const [inventory, setInventory] = useState([
    { 
      id: 1, 
      name: 'Stamella Shroom', 
      icon: '🍄', 
      quantity: 3,
      description: 'A great mushroom that grows near trees in the forest. Helps restore stamina.',
      type: 'Mushroom'
    },
    { 
      id: 2, 
      name: 'Hearty Durian', 
      icon: '🍈', 
      quantity: 2,
      description: 'A tough, spiky fruit. Known for its revitalizing properties.',
      type: 'Fruit'
    },
  ]);

  // Database of known items
  const knownItems = [
    { name: 'Stamella Shroom', icon: '🍄', type: 'Mushroom' },
    { name: 'Hearty Durian', icon: '🍈', type: 'Fruit' },
    { name: 'Swift Carrot', icon: '🥕', type: 'Vegetable' },
    { name: 'Endura Shroom', icon: '🍄', type: 'Mushroom' },
    { name: 'Mighty Bananas', icon: '🍌', type: 'Fruit' },
  ];

  const [newItemInput, setNewItemInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const handleInputChange = (value) => {
    setNewItemInput(value);
    if (value.length > 0) {
      const matches = knownItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestion(null);
  };

  const selectItem = (item) => {
    setNewItemInput(item.name);
    setSelectedSuggestion(item);
    setShowSuggestions(false);
  };

  const addNewItem = () => {
    if (selectedSuggestion) {
      const existingItem = inventory.find(item => item.name === selectedSuggestion.name);
      
      if (existingItem) {
        setInventory(inventory.map(item =>
          item.name === selectedSuggestion.name
            ? { ...item, quantity: item.quantity + newItemQuantity }
            : item
        ));
      } else {
        setInventory([...inventory, {
          id: Date.now(),
          ...selectedSuggestion,
          quantity: newItemQuantity
        }]);
      }
      setNewItemInput('');
      setSelectedSuggestion(null);
      setNewItemQuantity(1);
    }
  };

  const adjustQuantity = (itemId, amount) => {
    setInventory(inventory.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + amount);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 h-[calc(100vh-120px)]">
      {/* Add Item Section */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
        <h2 className="text-lg font-semibold mb-4">Add Item</h2>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newItemInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type item name..."
              className="w-full p-2 border rounded-lg"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    className="w-full p-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => selectItem(item)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setNewItemQuantity(Math.max(1, newItemQuantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              -
            </button>
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center p-2 border rounded-lg"
            />
            <button 
              onClick={() => setNewItemQuantity(newItemQuantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              +
            </button>
          </div>
          <button
            onClick={addNewItem}
            disabled={!selectedSuggestion}
            className={`px-4 py-2 rounded-lg ${
              selectedSuggestion 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add
          </button>
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {inventory.map(item => (
          <div 
            key={item.id}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
          >
            {/* Item Icon and Info */}
            <div className="flex items-center gap-4 flex-1">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.type}</p>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => adjustQuantity(item.id, -1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <span className="w-12 text-center">{item.quantity}</span>
              <button 
                onClick={() => adjustQuantity(item.id, 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
              <button 
                onClick={() => adjustQuantity(item.id, -item.quantity)}
                className="ml-2 text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const ScanView = ({ setActiveTab }) => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [foundItems, setFoundItems] = useState([]);
  

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setIsProcessing(true);
      // Simulate processing - replace with actual API call
      setTimeout(() => {
        setIsProcessing(false);
        setScanComplete(true);
        setFoundItems([
          { name: 'Dandelion', quantity: 2, icon: '🌼' },
          { name: 'Yarrow', quantity: 1, icon: '🌿' }
        ]);
      }, 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {!scanComplete ? (
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 bg-gray-50">
            {image ? (
              <div className="relative w-full h-full">
                <img src={image} alt="Uploaded" className="w-full h-full object-contain" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-xl">Processing Image...</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Camera className="w-16 h-16 text-gray-400 mb-4" />
                <label className="px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600">
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <p className="mt-2 text-gray-500">Click to upload or drag and drop</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-100 p-4 rounded-lg text-green-700 text-center">
            Scan completed successfully!
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Items Found:</h3>
            <div className="space-y-3">
              {foundItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => {
                  setImage(null);
                  setScanComplete(false);
                  setFoundItems([]);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Scan Another
              </button>
              <button 
                onClick={() => setActiveTab('inventory')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default SurvivalPlatform;