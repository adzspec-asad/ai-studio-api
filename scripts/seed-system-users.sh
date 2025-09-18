#!/bin/bash

# System User Seeding Script
# This script helps you choose and run the appropriate seeder for your environment

echo "🌱 System User Seeding Script"
echo "=============================="
echo ""
echo "Available seeders:"
echo "1. Development Seeder (3 hardcoded users)"
echo "2. Production Seeder (1 superadmin from env vars)"
echo "3. Factory Seeder (8+ users with fake data)"
echo "4. All Seeders (run all database seeders)"
echo "5. Fresh Database + Seeders (reset and seed)"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
  1)
    echo "🔧 Running development seeder..."
    node ace db:seed --files="database/seeders/system_user_seeder.ts"
    ;;
  2)
    echo "🏭 Running production seeder..."
    echo "Make sure you have set SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, and SUPERADMIN_NAME environment variables!"
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
      node ace db:seed --files="database/seeders/production_system_user_seeder.ts"
    else
      echo "Cancelled."
    fi
    ;;
  3)
    echo "🏭 Running factory seeder..."
    node ace db:seed --files="database/seeders/factory_system_user_seeder.ts"
    ;;
  4)
    echo "🌱 Running all seeders..."
    node ace db:seed
    ;;
  5)
    echo "🔄 Fresh database with seeders..."
    echo "⚠️  WARNING: This will DROP ALL TABLES and recreate them!"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
      node ace migration:fresh --seed
    else
      echo "Cancelled."
    fi
    ;;
  *)
    echo "❌ Invalid option. Please choose 1-5."
    exit 1
    ;;
esac

echo ""
echo "✅ Seeding completed!"
echo ""
echo "💡 Next steps:"
echo "   1. Test login with created credentials"
echo "   2. Change default passwords in production"
echo "   3. Create additional users as needed"
echo ""
echo "🔗 Login endpoint: POST /api/system/auth/login"
