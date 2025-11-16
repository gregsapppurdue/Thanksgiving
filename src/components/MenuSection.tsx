import React, { useState } from 'react';
import { menuItems } from '../data/menuItems';

export const MenuSection: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Items that are NOT vegetarian
  const nonVegetarianItems = ['roast-turkey', 'turkey-gravy', 'deviled-eggs'];
  
  const isVegetarian = (itemId: string) => {
    return !nonVegetarianItems.includes(itemId);
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-amber-100 p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-pumpkin mb-6 flex items-center gap-2">
        <span>Our Thanksgiving Menu</span>
        <span className="text-2xl" aria-hidden="true">
          🍽️
        </span>
      </h2>
      <p className="text-sm md:text-base text-sage/90 mb-8">
        Hover over any menu item to see its history and full ingredient list.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item: { id: string; name: string; photo: string; hover: { history: string; ingredients: string[] } }) => (
          <div
            key={item.id}
            className="relative group"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onFocus={() => setHoveredItem(item.id)}
            onBlur={() => setHoveredItem(null)}
          >
            <div
              className={`bg-white rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                hoveredItem === item.id
                  ? 'border-pumpkin shadow-lg scale-105'
                  : 'border-amber-200 hover:border-amber-300'
              }`}
              tabIndex={0}
              role="button"
              aria-label={`${item.name}. Hover or focus to see history and ingredients.`}
            >
              {/* Photo */}
              <div className="relative h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden flex items-center justify-center">
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {hoveredItem === item.id && (
                  <div className="absolute inset-0 bg-pumpkin/20 transition-opacity duration-300 z-10" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-sage text-lg mb-3 flex items-center gap-2">
                  <span>{item.name}</span>
                  {isVegetarian(item.id) && (
                    <span 
                      className="text-green-600 text-base" 
                      title="Vegetarian-friendly"
                      aria-label="Vegetarian-friendly"
                    >
                      🌿
                    </span>
                  )}
                </h4>

                {hoveredItem === item.id && (
                  <div
                    className="mt-3 pt-3 border-t border-amber-200 animate-in fade-in duration-200 space-y-3"
                    role="region"
                    aria-label="History and Ingredients"
                  >
                    {/* History */}
                    <div>
                      <p className="text-xs font-semibold text-pumpkin mb-2 uppercase tracking-wide">
                        History:
                      </p>
                      <p className="text-xs text-sage/90 leading-relaxed">
                        {item.hover.history}
                      </p>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <p className="text-xs font-semibold text-pumpkin mb-2 uppercase tracking-wide">
                        Ingredients:
                      </p>
                          <ul className="text-xs text-sage/90 space-y-1">
                            {item.hover.ingredients.map((ingredient: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-pumpkin mr-2">•</span>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
