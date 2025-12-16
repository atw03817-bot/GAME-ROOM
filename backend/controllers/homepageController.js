import HomepageConfig from '../models/HomepageConfig.js';
import FeaturedDealsSettings from '../models/FeaturedDealsSettings.js';
import ExclusiveOffersSettings from '../models/ExclusiveOffersSettings.js';

// Get homepage configuration
export const getHomepageConfig = async (req, res) => {
  try {
    let config = await HomepageConfig.findOne({ active: true });

    if (!config) {
      // إنشاء config افتراضي
      config = new HomepageConfig({
        active: true,
        sections: []
      });
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update entire homepage configuration
export const updateHomepageConfig = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const config = await HomepageConfig.findOneAndUpdate(
      { active: true },
      updateData,
      { new: true, upsert: true }
    );

    console.log('✅ Homepage config updated');
    res.json(config);
  } catch (error) {
    console.error('Error updating homepage config:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add new section
export const addSection = async (req, res) => {
  try {
    const config = await HomepageConfig.findOne({ active: true });
    const currentSections = config?.sections || [];

    const newSection = {
      id: new Date().getTime().toString(),
      type: req.body.type,
      title: req.body.title || '',
      subtitle: req.body.subtitle || '',
      order: req.body.order || currentSections.length + 1,
      active: true,
      settings: req.body.settings || {},
      content: req.body.content || {}
    };

    config.sections.push(newSection);
    config.updatedAt = new Date();
    await config.save();

    res.json(config);
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update section
export const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const config = await HomepageConfig.findOne({ active: true });

    if (config && config.sections) {
      const sectionIndex = config.sections.findIndex(s => s.id === sectionId);

      if (sectionIndex !== -1) {
        config.sections[sectionIndex] = {
          ...config.sections[sectionIndex].toObject(),
          ...req.body
        };

        config.updatedAt = new Date();
        await config.save();
      }
    }

    res.json(config);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete section
export const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const config = await HomepageConfig.findOne({ active: true });

    if (config) {
      config.sections = config.sections.filter(s => s.id !== sectionId);
      config.updatedAt = new Date();
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reorder sections
export const reorderSections = async (req, res) => {
  try {
    const { sections } = req.body;
    const config = await HomepageConfig.findOne({ active: true });

    if (config) {
      const updatedSections = sections.map((section, index) => ({
        ...section,
        order: index + 1
      }));

      config.sections = updatedSections;
      config.updatedAt = new Date();
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Duplicate section
export const duplicateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const config = await HomepageConfig.findOne({ active: true });

    if (config && config.sections) {
      const sectionIndex = config.sections.findIndex(s => s.id === sectionId);

      if (sectionIndex !== -1) {
        const originalSection = config.sections[sectionIndex].toObject();
        const duplicatedSection = {
          ...originalSection,
          id: new Date().getTime().toString(),
          title: `${originalSection.title} (نسخة)`,
          order: originalSection.order + 1
        };

        config.sections.splice(sectionIndex + 1, 0, duplicatedSection);

        // Update orders
        config.sections.forEach((section, idx) => {
          section.order = idx + 1;
        });

        config.updatedAt = new Date();
        await config.save();
      }
    }

    res.json(config);
  } catch (error) {
    console.error('Error duplicating section:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle section visibility
export const toggleSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const config = await HomepageConfig.findOne({ active: true });

    if (config && config.sections) {
      const sectionIndex = config.sections.findIndex(s => s.id === sectionId);

      if (sectionIndex !== -1) {
        config.sections[sectionIndex].active = !config.sections[sectionIndex].active;
        config.updatedAt = new Date();
        await config.save();
      }
    }

    res.json(config);
  } catch (error) {
    console.error('Error toggling section:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============= FEATURED DEALS SETTINGS =============

export const getFeaturedDealsSettings = async (req, res) => {
  try {
    let settings = await FeaturedDealsSettings.findOne({});

    if (!settings) {
      settings = new FeaturedDealsSettings();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching featured deals settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFeaturedDealsSettings = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const settings = await FeaturedDealsSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true }
    );

    console.log('✅ Featured deals settings updated');
    res.json(settings);
  } catch (error) {
    console.error('Error updating featured deals settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============= EXCLUSIVE OFFERS SETTINGS =============

export const getExclusiveOffersSettings = async (req, res) => {
  try {
    let settings = await ExclusiveOffersSettings.findOne({});

    if (!settings) {
      settings = new ExclusiveOffersSettings();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching exclusive offers settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateExclusiveOffersSettings = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const settings = await ExclusiveOffersSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true }
    );

    console.log('✅ Exclusive offers settings updated');
    res.json(settings);
  } catch (error) {
    console.error('Error updating exclusive offers settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
