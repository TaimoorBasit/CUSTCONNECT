/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full access',
        permissions: ['*']
      }
    }),
    prisma.role.upsert({
      where: { name: 'UNIVERSITY_ADMIN' },
      update: {},
      create: {
        name: 'UNIVERSITY_ADMIN',
        description: 'University Administrator',
        permissions: ['manage_university', 'moderate_content', 'manage_users']
      }
    }),
    prisma.role.upsert({
      where: { name: 'CAFE_OWNER' },
      update: {},
      create: {
        name: 'CAFE_OWNER',
        description: 'Café Owner',
        permissions: ['manage_cafe', 'update_menu', 'update_deals']
      }
    }),
    prisma.role.upsert({
      where: { name: 'BUS_OPERATOR' },
      update: {},
      create: {
        name: 'BUS_OPERATOR',
        description: 'Bus Operator',
        permissions: ['manage_bus', 'update_schedule', 'send_notifications']
      }
    }),
    prisma.role.upsert({
      where: { name: 'PRINTER_SHOP_OWNER' },
      update: {},
      create: {
        name: 'PRINTER_SHOP_OWNER',
        description: 'Printer Shop Owner',
        permissions: ['manage_printer_shop', 'view_print_requests', 'update_print_status']
      }
    }),
    prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: {
        name: 'STUDENT',
        description: 'Student User',
        permissions: ['create_posts', 'view_content', 'use_services']
      }
    })
  ]);

  console.log('✅ Roles created');

  // Create universities
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { name: 'Capital University of Science and Technology' },
      update: {},
      create: {
        name: 'Capital University of Science and Technology',
        domain: 'cust.edu.pk',
        country: 'Pakistan',
        city: 'Islamabad'
      }
    })
  ]);

  console.log('✅ Universities created');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name_universityId: { name: 'Computer Science', universityId: universities[0]!.id } },
      update: {},
      create: {
        name: 'Computer Science',
        code: 'CS',
        universityId: universities[0]!.id
      }
    }),
    prisma.department.upsert({
      where: { name_universityId: { name: 'Business Administration', universityId: universities[0]!.id } },
      update: {},
      create: {
        name: 'Business Administration',
        code: 'BA',
        universityId: universities[0]!.id
      }
    }),
    prisma.department.upsert({
      where: { name_universityId: { name: 'Engineering', universityId: universities[0].id } },
      update: {},
      create: {
        name: 'Engineering',
        code: 'ENG',
        universityId: universities[0]!.id
      }
    })
  ]);

  console.log('✅ Departments created');

  // Create super admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@custconnect.com' },
    update: {},
    create: {
      email: 'admin@custconnect.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isVerified: true,
      universityId: universities[0]!.id,
      departmentId: departments[0]!.id,
      year: 4
    }
  });

  // Assign super admin role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: roles[0].id } },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: roles[0]!.id
    }
  });

  console.log('✅ Super admin created');

  // Create Bus Owner
  const busOwner = await prisma.user.upsert({
    where: { email: 'busowner@custconnect.com' },
    update: {},
    create: {
      email: 'busowner@custconnect.com',
      password: hashedPassword,
      firstName: 'Bus',
      lastName: 'Operator',
      isVerified: true,
      universityId: universities[0]!.id,
      departmentId: departments[0]!.id,
      year: null
    }
  });

  // Assign bus operator role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: busOwner.id, roleId: roles[3].id } },
    update: {},
    create: {
      userId: busOwner.id,
      roleId: roles[3]!.id // BUS_OPERATOR role
    }
  });

  console.log('✅ Bus owner created');

  // Create Cafe Owner
  const cafeOwner = await prisma.user.upsert({
    where: { email: 'cafeowner@custconnect.com' },
    update: {},
    create: {
      email: 'cafeowner@custconnect.com',
      password: hashedPassword,
      firstName: 'Cafe',
      lastName: 'Owner',
      isVerified: true,
      universityId: universities[0]!.id,
      departmentId: departments[0]!.id,
      year: null
    }
  });

  // Assign cafe owner role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: cafeOwner.id, roleId: roles[2].id } },
    update: {},
    create: {
      userId: cafeOwner.id,
      roleId: roles[2]!.id // CAFE_OWNER role
    }
  });

  console.log('✅ Cafe owner created');

  // Create sample students (more dummy accounts)
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@cust.edu.pk' },
      update: {},
      create: {
        email: 'student1@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Ahmed',
        lastName: 'Khan',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[0].id,
        year: 3,
        studentId: 'CS-2021-001'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student2@cust.edu.pk' },
      update: {},
      create: {
        email: 'student2@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Sara',
        lastName: 'Ali',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[1].id,
        year: 2,
        studentId: 'BA-2022-002'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student3@cust.edu.pk' },
      update: {},
      create: {
        email: 'student3@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Hassan',
        lastName: 'Raza',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[2].id,
        year: 4,
        studentId: 'ENG-2020-003'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student4@cust.edu.pk' },
      update: {},
      create: {
        email: 'student4@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Fatima',
        lastName: 'Ahmed',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[0].id,
        year: 1,
        studentId: 'CS-2024-004'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student5@cust.edu.pk' },
      update: {},
      create: {
        email: 'student5@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Ali',
        lastName: 'Hassan',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[1].id,
        year: 4,
        studentId: 'BA-2020-005'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student6@cust.edu.pk' },
      update: {},
      create: {
        email: 'student6@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Zainab',
        lastName: 'Malik',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[0].id,
        year: 2,
        studentId: 'CS-2023-006'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student7@cust.edu.pk' },
      update: {},
      create: {
        email: 'student7@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Usman',
        lastName: 'Sheikh',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[0].id,
        year: 3,
        studentId: 'CS-2022-007'
      }
    }),
    prisma.user.upsert({
      where: { email: 'student8@cust.edu.pk' },
      update: {},
      create: {
        email: 'student8@cust.edu.pk',
        password: hashedPassword,
        firstName: 'Ayesha',
        lastName: 'Butt',
        isVerified: true,
        universityId: universities[0].id,
        departmentId: departments[2].id,
        year: 1,
        studentId: 'ENG-2024-008'
      }
    })
  ]);

  // Assign student roles
  for (const student of students) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: student.id, roleId: roles[5].id } },
      update: {},
      create: {
        userId: student.id,
        roleId: roles[5].id // STUDENT role
      }
    });
  }

  console.log('✅ Sample students created (8 students)');

  // Create bus routes (skip if already exist)
  const busRoutes = await Promise.all([
    prisma.busRoute.upsert({
      where: {
        name_universityId: {
          name: 'Main Campus Route',
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'Main Campus Route',
        number: 'MC-01',
        description: 'Main campus to city center',
        universityId: universities[0]!.id,
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' }
          ]
        }
      }
    }),
    prisma.busRoute.upsert({
      where: {
        name_universityId: {
          name: 'North Campus Route',
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'North Campus Route',
        number: 'NC-02',
        description: 'North campus to main campus',
        universityId: universities[0]!.id,
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: '07:30', endTime: '19:00' },
            { dayOfWeek: 2, startTime: '07:30', endTime: '19:00' },
            { dayOfWeek: 3, startTime: '07:30', endTime: '19:00' },
            { dayOfWeek: 4, startTime: '07:30', endTime: '19:00' },
            { dayOfWeek: 5, startTime: '07:30', endTime: '19:00' }
          ]
        }
      }
    }),
    prisma.busRoute.upsert({
      where: {
        name_universityId: {
          name: 'South Campus Route',
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'South Campus Route',
        number: 'SC-03',
        description: 'South campus to main campus',
        universityId: universities[0]!.id,
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: '08:15', endTime: '17:45' },
            { dayOfWeek: 2, startTime: '08:15', endTime: '17:45' },
            { dayOfWeek: 3, startTime: '08:15', endTime: '17:45' },
            { dayOfWeek: 4, startTime: '08:15', endTime: '17:45' },
            { dayOfWeek: 5, startTime: '08:15', endTime: '17:45' }
          ]
        }
      }
    }),
    prisma.busRoute.upsert({
      where: {
        name_universityId: {
          name: 'Express Route',
          universityId: universities[0]!.id
        }
      },
      update: {},
      create: {
        name: 'Express Route',
        number: 'EX-04',
        description: 'Express service to city center',
        universityId: universities[0].id,
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
          ]
        }
      }
    }),
    prisma.busRoute.upsert({
      where: {
        name_universityId: {
          name: 'Weekend Route',
          universityId: universities[0]!.id
        }
      },
      update: {},
      create: {
        name: 'Weekend Route',
        number: 'WE-05',
        description: 'Weekend service to campus',
        universityId: universities[0].id,
        schedules: {
          create: [
            { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
            { dayOfWeek: 0, startTime: '10:00', endTime: '16:00' }
          ]
        }
      }
    })
  ]);

  console.log('✅ Bus routes created');

  // Create cafés
  const cafes = await Promise.all([
    prisma.cafe.create({
      data: {
        name: 'Campus Coffee Corner',
        description: 'Fresh coffee and light snacks',
        location: 'Main Campus, Building A',
        phone: '+92-21-1234567',
        email: 'coffee@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '07:00-22:00',
          tuesday: '07:00-22:00',
          wednesday: '07:00-22:00',
          thursday: '07:00-22:00',
          friday: '07:00-22:00',
          saturday: '08:00-20:00',
          sunday: '09:00-18:00'
        }),
        universityId: universities[0]!.id,
        ownerId: cafeOwner.id, // Assign to cafe owner
        menus: {
          create: [
            { name: 'Cappuccino', description: 'Rich espresso with steamed milk', price: 150, category: 'Beverages' },
            { name: 'Latte', description: 'Espresso with lots of steamed milk', price: 160, category: 'Beverages' },
            { name: 'Chocolate Croissant', description: 'Buttery croissant with chocolate filling', price: 120, category: 'Pastries' },
            { name: 'Chicken Sandwich', description: 'Grilled chicken with fresh vegetables', price: 250, category: 'Sandwiches' }
          ]
        },
        deals: {
          create: [
            { title: 'Morning Special', description: 'Any coffee + pastry for 200', discount: 20, validFrom: new Date(), validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Student Union Café',
        description: 'Student-friendly prices and variety',
        location: 'Student Union Building',
        phone: '+92-21-1234568',
        email: 'union@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '08:00-23:00',
          tuesday: '08:00-23:00',
          wednesday: '08:00-23:00',
          thursday: '08:00-23:00',
          friday: '08:00-23:00',
          saturday: '09:00-21:00',
          sunday: '10:00-20:00'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Tea', description: 'Traditional Pakistani tea', price: 50, category: 'Beverages' },
            { name: 'Samosa', description: 'Crispy samosa with spicy filling', price: 30, category: 'Snacks' },
            { name: 'Pakora', description: 'Mixed vegetable pakoras', price: 80, category: 'Snacks' },
            { name: 'Chicken Biryani', description: 'Fragrant rice with spiced chicken', price: 200, category: 'Main Course' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Library Café',
        description: 'Quiet café near the library',
        location: 'Central Library, Ground Floor',
        phone: '+92-21-1234569',
        email: 'library@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '09:00-21:00',
          tuesday: '09:00-21:00',
          wednesday: '09:00-21:00',
          thursday: '09:00-21:00',
          friday: '09:00-21:00',
          saturday: '10:00-18:00',
          sunday: 'Closed'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Green Tea', description: 'Refreshing green tea', price: 80, category: 'Beverages' },
            { name: 'Fruit Smoothie', description: 'Fresh fruit smoothie', price: 180, category: 'Beverages' },
            { name: 'Energy Bar', description: 'Nutritious energy bar', price: 100, category: 'Snacks' },
            { name: 'Caesar Salad', description: 'Fresh salad with caesar dressing', price: 220, category: 'Salads' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Engineering Café',
        description: 'Café for engineering students',
        location: 'Engineering Block, 2nd Floor',
        phone: '+92-21-1234570',
        email: 'engineering@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '07:30-20:00',
          tuesday: '07:30-20:00',
          wednesday: '07:30-20:00',
          thursday: '07:30-20:00',
          friday: '07:30-20:00',
          saturday: '08:00-18:00',
          sunday: 'Closed'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Americano', description: 'Strong black coffee', price: 120, category: 'Beverages' },
            { name: 'Muffin', description: 'Fresh baked muffin', price: 90, category: 'Pastries' },
            { name: 'Pizza Slice', description: 'Cheese pizza slice', price: 150, category: 'Fast Food' },
            { name: 'Chicken Wrap', description: 'Grilled chicken wrap', price: 180, category: 'Wraps' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Business School Café',
        description: 'Professional atmosphere for business students',
        location: 'Business School, Lobby',
        phone: '+92-21-1234571',
        email: 'business@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '08:00-19:00',
          tuesday: '08:00-19:00',
          wednesday: '08:00-19:00',
          thursday: '08:00-19:00',
          friday: '08:00-19:00',
          saturday: '09:00-17:00',
          sunday: 'Closed'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Espresso', description: 'Single shot espresso', price: 100, category: 'Beverages' },
            { name: 'Macchiato', description: 'Espresso with foam', price: 140, category: 'Beverages' },
            { name: 'Quiche', description: 'Savory quiche slice', price: 200, category: 'Pastries' },
            { name: 'Club Sandwich', description: 'Three-layer club sandwich', price: 280, category: 'Sandwiches' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Arts Café',
        description: 'Creative space for arts students',
        location: 'Arts Block, 1st Floor',
        phone: '+92-21-1234572',
        email: 'arts@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '09:00-20:00',
          tuesday: '09:00-20:00',
          wednesday: '09:00-20:00',
          thursday: '09:00-20:00',
          friday: '09:00-20:00',
          saturday: '10:00-18:00',
          sunday: 'Closed'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Chai Latte', description: 'Spiced tea latte', price: 110, category: 'Beverages' },
            { name: 'Cinnamon Roll', description: 'Sweet cinnamon roll', price: 130, category: 'Pastries' },
            { name: 'Veggie Wrap', description: 'Fresh vegetable wrap', price: 160, category: 'Wraps' },
            { name: 'Fruit Bowl', description: 'Fresh seasonal fruits', price: 140, category: 'Healthy' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Science Café',
        description: 'Café for science students',
        location: 'Science Block, Ground Floor',
        phone: '+92-21-1234573',
        email: 'science@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '08:00-21:00',
          tuesday: '08:00-21:00',
          wednesday: '08:00-21:00',
          thursday: '08:00-21:00',
          friday: '08:00-21:00',
          saturday: '09:00-19:00',
          sunday: '10:00-17:00'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Cold Brew', description: 'Smooth cold brew coffee', price: 160, category: 'Beverages' },
            { name: 'Bagel', description: 'Fresh bagel with cream cheese', price: 120, category: 'Pastries' },
            { name: 'Tuna Salad', description: 'Fresh tuna salad', price: 240, category: 'Salads' },
            { name: 'Protein Bar', description: 'High protein energy bar', price: 150, category: 'Healthy' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Medical Café',
        description: 'Café for medical students',
        location: 'Medical Block, 3rd Floor',
        phone: '+92-21-1234574',
        email: 'medical@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '07:00-22:00',
          tuesday: '07:00-22:00',
          wednesday: '07:00-22:00',
          thursday: '07:00-22:00',
          friday: '07:00-22:00',
          saturday: '08:00-20:00',
          sunday: '09:00-18:00'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Black Coffee', description: 'Strong black coffee', price: 80, category: 'Beverages' },
            { name: 'Granola Bar', description: 'Healthy granola bar', price: 90, category: 'Healthy' },
            { name: 'Chicken Salad', description: 'Grilled chicken salad', price: 220, category: 'Salads' },
            { name: 'Energy Drink', description: 'Natural energy drink', price: 120, category: 'Beverages' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Law Café',
        description: 'Café for law students',
        location: 'Law School, 2nd Floor',
        phone: '+92-21-1234575',
        email: 'law@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '08:30-19:30',
          tuesday: '08:30-19:30',
          wednesday: '08:30-19:30',
          thursday: '08:30-19:30',
          friday: '08:30-19:30',
          saturday: '09:00-17:00',
          sunday: 'Closed'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Cortado', description: 'Espresso with warm milk', price: 130, category: 'Beverages' },
            { name: 'Scone', description: 'Traditional English scone', price: 100, category: 'Pastries' },
            { name: 'Turkey Sandwich', description: 'Sliced turkey sandwich', price: 260, category: 'Sandwiches' },
            { name: 'Soup of the Day', description: 'Daily soup special', price: 180, category: 'Soups' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Sports Café',
        description: 'Café near sports facilities',
        location: 'Sports Complex, Ground Floor',
        phone: '+92-21-1234576',
        email: 'sports@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '06:00-22:00',
          tuesday: '06:00-22:00',
          wednesday: '06:00-22:00',
          thursday: '06:00-22:00',
          friday: '06:00-22:00',
          saturday: '07:00-21:00',
          sunday: '08:00-20:00'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Protein Shake', description: 'Chocolate protein shake', price: 200, category: 'Beverages' },
            { name: 'Banana Bread', description: 'Moist banana bread', price: 110, category: 'Pastries' },
            { name: 'Chicken Breast', description: 'Grilled chicken breast', price: 300, category: 'Main Course' },
            { name: 'Fruit Smoothie', description: 'Mixed fruit smoothie', price: 180, category: 'Beverages' }
          ]
        }
      }
    }),
    prisma.cafe.create({
      data: {
        name: 'Graduate Café',
        description: 'Café for graduate students',
        location: 'Graduate Block, 1st Floor',
        phone: '+92-21-1234577',
        email: 'graduate@campus.edu.pk',
        openingHours: JSON.stringify({
          monday: '09:00-21:00',
          tuesday: '09:00-21:00',
          wednesday: '09:00-21:00',
          thursday: '09:00-21:00',
          friday: '09:00-21:00',
          saturday: '10:00-19:00',
          sunday: '11:00-18:00'
        }),
        universityId: universities[0]!.id,
        menus: {
          create: [
            { name: 'Flat White', description: 'Espresso with microfoam', price: 170, category: 'Beverages' },
            { name: 'Croissant', description: 'Buttery French croissant', price: 140, category: 'Pastries' },
            { name: 'Avocado Toast', description: 'Smashed avocado on toast', price: 200, category: 'Healthy' },
            { name: 'Quinoa Bowl', description: 'Healthy quinoa bowl', price: 250, category: 'Healthy' }
          ]
        }
      }
    })
  ]);

  console.log('✅ Cafés created');

  // Create courses (skip if already exist)
  const courses = await Promise.all([
    prisma.course.upsert({
      where: {
        code_universityId: {
          code: 'CS-101',
          universityId: universities[0]!.id
        }
      },
      update: {},
      create: {
        name: 'Introduction to Programming',
        code: 'CS-101',
        credits: 3,
        description: 'Basic programming concepts and problem solving',
        universityId: universities[0].id
      }
    }),
    prisma.course.upsert({
      where: {
        code_universityId: {
          code: 'CS-201',
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'Data Structures and Algorithms',
        code: 'CS-201',
        credits: 4,
        description: 'Fundamental data structures and algorithmic techniques',
        universityId: universities[0].id
      }
    }),
    prisma.course.upsert({
      where: {
        code_universityId: {
          code: 'CS-301',
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'Database Systems',
        code: 'CS-301',
        credits: 3,
        description: 'Database design and management',
        universityId: universities[0].id
      }
    })
  ]);

  console.log('✅ Courses created');

  // Create semesters (skip if already exist)
  const semesters = await Promise.all([
    prisma.semester.upsert({
      where: {
        name_year_universityId: {
          name: 'Fall 2024',
          year: 2024,
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'Fall 2024',
        year: 2024,
        universityId: universities[0].id
      }
    }),
    prisma.semester.upsert({
      where: {
        name_year_universityId: {
          name: 'Spring 2024',
          year: 2024,
          universityId: universities[0].id
        }
      },
      update: {},
      create: {
        name: 'Spring 2024',
        year: 2024,
        universityId: universities[0].id
      }
    })
  ]);

  console.log('✅ Semesters created');

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: 'Just finished my first programming assignment! Feeling accomplished 🎉',
        authorId: students[0].id,
        privacy: 'PUBLIC'
      }
    }),
    prisma.post.create({
      data: {
        content: 'Anyone know where I can find good study materials for CS-201?',
        authorId: students[1].id,
        privacy: 'UNIVERSITY_ONLY'
      }
    }),
    prisma.post.create({
      data: {
        content: 'Great coffee at Campus Coffee Corner! Highly recommend the cappuccino ☕',
        authorId: students[2].id,
        privacy: 'PUBLIC'
      }
    })
  ]);

  console.log('✅ Sample posts created');

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Programming Workshop',
        description: 'Learn advanced programming techniques',
        location: 'Computer Lab 1',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        organizerId: students[0].id,
        universityId: universities[0].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Career Fair 2024',
        description: 'Meet with top companies and explore career opportunities',
        location: 'Main Auditorium',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
        organizerId: superAdmin.id,
        universityId: universities[0].id
      }
    })
  ]);

  console.log('✅ Sample events created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

