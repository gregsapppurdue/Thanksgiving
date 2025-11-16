import React, { useState } from 'react';
import { menuItems } from '../data/menuItems';

export const MenuSection: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const courses = ['Main', 'Side', 'Dessert', 'Drink'];
  const groupedItems = courses.reduce((acc, course) => {
    acc[course] = menuItems.filter(item => item.course === course);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-amber-100 p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-pumpkin mb-6 flex items-center gap-2">
        <span>Our Thanksgiving Menu</span>
        <span className="text-2xl" aria-hidden="true">
          🍽️
        </span>
      </h2>
      <p className="text-sm md:text-base text-sage/90 mb-8">
        Hover over any menu item to see the full ingredient list.
      </p>

      <div className="space-y-8">
        {courses.map((course) => {
          const items = groupedItems[course];
          if (items.length === 0) return null;

          return (
            <div key={course}>
              <h3 className="text-xl font-serif font-semibold text-maple mb-4 border-b border-amber-200 pb-2">
                {course}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onFocus={() => setHoveredItem(item.id)}
                    onBlur={() => setHoveredItem(null)}
                  >
                    <div
                      className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer ${
                        hoveredItem === item.id
                          ? 'border-pumpkin shadow-lg scale-105'
                          : 'border-amber-200 hover:border-amber-300'
                      }`}
                      tabIndex={0}
                      role="button"
                      aria-label={`${item.name} - ${item.description}. Hover or focus to see ingredients.`}
                    >
                      <h4 className="font-semibold text-sage text-lg mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-sage/80 mb-3">
                        {item.description}
                      </p>

                      {hoveredItem === item.id && (
                        <div
                          className="mt-3 pt-3 border-t border-amber-200 animate-in fade-in duration-200"
                          role="region"
                          aria-label="Ingredients"
                        >
                          <p className="text-xs font-semibold text-pumpkin mb-2 uppercase tracking-wide">
                            Ingredients:
                          </p>
                          <ul className="text-xs text-sage/90 space-y-1">
                            {item.ingredients.map((ingredient, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-pumpkin mr-2">•</span>
                                <span>{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

