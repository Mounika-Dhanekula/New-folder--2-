// Meal planner functionality
class MealPlanner {
  constructor() {
    this.currentDay = 'monday';
    this.selectedGoal = 'maintenance';
    this.init();
  }

  init() {
    if (!HealthSyncUtils.requireAuth()) return;
    
    this.setupEventListeners();
    this.loadMealPlan();
    this.setupGoalSelection();
  }

  setupEventListeners() {
    // Day selection
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentDay = e.target.dataset.day;
        this.loadMealPlan();
      });
    });

    // Goal selection
    document.querySelectorAll('.goal-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedGoal = e.currentTarget.dataset.goal;
        this.generateNewPlan();
      });
    });

    // Dietary preferences
    document.querySelectorAll('input[name="diet"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.generateNewPlan();
      });
    });

    // Generate new plan button
    document.querySelector('.btn-generate').addEventListener('click', () => {
      this.generateNewPlan();
    });

    // Recipe buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-small') && e.target.textContent === 'View Recipe') {
        this.showRecipe(e.target.closest('.meal-card'));
      }
    });
  }

  setupGoalSelection() {
    // Set default active goal
    const defaultGoal = document.querySelector('[data-goal="maintenance"]');
    if (defaultGoal) {
      defaultGoal.classList.add('active');
    }
  }

  loadMealPlan() {
    // In a real app, this would fetch from an API based on the selected day and preferences
    const mealPlan = this.getSampleMealPlan();
    
    // Update nutrition summary
    this.updateNutritionSummary(mealPlan.nutrition);
  }

  getSampleMealPlan() {
    const plans = {
      weight_loss: {
        breakfast: { name: 'Oatmeal with Berries', calories: 350, protein: 12 },
        lunch: { name: 'Quinoa Salad', calories: 450, protein: 18 },
        dinner: { name: 'Grilled Chicken with Vegetables', calories: 500, protein: 35 },
        nutrition: { calories: 1300, protein: 65, carbs: 45, fat: 30 }
      },
      maintenance: {
        breakfast: { name: 'Greek Yogurt with Granola', calories: 400, protein: 20 },
        lunch: { name: 'Chicken Wrap', calories: 550, protein: 25 },
        dinner: { name: 'Salmon with Sweet Potato', calories: 600, protein: 40 },
        nutrition: { calories: 1550, protein: 85, carbs: 60, fat: 35 }
      },
      muscle_gain: {
        breakfast: { name: 'Protein Pancakes', calories: 600, protein: 35 },
        lunch: { name: 'Beef and Rice Bowl', calories: 700, protein: 45 },
        dinner: { name: 'Turkey Meatballs with Pasta', calories: 800, protein: 50 },
        nutrition: { calories: 2100, protein: 130, carbs: 85, fat: 45 }
      },
      diabetic: {
        breakfast: { name: 'Scrambled Eggs with Avocado', calories: 400, protein: 25 },
        lunch: { name: 'Lentil Soup', calories: 450, protein: 22 },
        dinner: { name: 'Baked Fish with Broccoli', calories: 500, protein: 35 },
        nutrition: { calories: 1350, protein: 82, carbs: 35, fat: 28 }
      }
    };

    return plans[this.selectedGoal] || plans.maintenance;
  }

  updateNutritionSummary(nutrition) {
    document.querySelector('.nutrition-value:nth-child(1)').textContent = nutrition.calories;
    document.querySelector('.nutrition-value:nth-child(2)').textContent = nutrition.protein + 'g';
    document.querySelector('.nutrition-value:nth-child(3)').textContent = nutrition.carbs + 'g';
    document.querySelector('.nutrition-value:nth-child(4)').textContent = nutrition.fat + 'g';
  }

  generateNewPlan() {
    // Show loading state
    const generateBtn = document.querySelector('.btn-generate');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;

    // Simulate AI generation delay
    setTimeout(() => {
      this.loadMealPlan();
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
      
      this.showMessage('New meal plan generated successfully!', 'success');
    }, 2000);
  }

  showRecipe(mealCard) {
    const mealName = mealCard.querySelector('h5').textContent;
    const recipes = {
      'Oatmeal with Berries': {
        ingredients: ['1/2 cup oats', '1 cup water', '1/2 cup mixed berries', '1 tbsp honey'],
        instructions: ['Cook oats with water for 5 minutes', 'Top with berries and honey']
      },
      'Quinoa Salad': {
        ingredients: ['1 cup cooked quinoa', '1/2 cucumber', '1/2 bell pepper', '2 tbsp olive oil'],
        instructions: ['Chop vegetables', 'Mix with quinoa', 'Add dressing and serve']
      },
      'Grilled Chicken with Vegetables': {
        ingredients: ['150g chicken breast', '1 cup mixed vegetables', '1 tsp olive oil', 'Herbs and spices'],
        instructions: ['Season chicken', 'Grill for 6-8 minutes per side', 'Steam vegetables']
      }
    };

    const recipe = recipes[mealName];
    if (recipe) {
      const modal = this.createRecipeModal(mealName, recipe);
      document.body.appendChild(modal);
    }
  }

  createRecipeModal(mealName, recipe) {
    const modal = document.createElement('div');
    modal.className = 'recipe-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3>${mealName} Recipe</h3>
        <h4>Ingredients:</h4>
        <ul>
          ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h4>Instructions:</h4>
        <ol>
          ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
        <button class="btn" onclick="this.closest('.recipe-modal').remove()">Close</button>
      </div>
    `;

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    return modal;
  }

  showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `meal-planner-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      border-radius: 8px;
      font-weight: 600;
      background: ${type === 'error' ? '#ffe6e6' : '#e6ffed'};
      color: ${type === 'error' ? '#d63031' : '#00b894'};
      border: 2px solid ${type === 'error' ? '#ff7675' : '#55efc4'};
      z-index: 1000;
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }
}

// Initialize meal planner
document.addEventListener('DOMContentLoaded', () => {
  new MealPlanner();
});